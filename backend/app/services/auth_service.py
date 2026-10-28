import hashlib
from datetime import datetime, timezone
from typing import Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.audit_log import AuditLog
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import UserLoginRequest, UserRegisterRequest


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: UserRegisterRequest) -> Tuple[User, str, str]:
        normalized_email = req.email.lower().strip()

        # Check existing user
        query = select(User).where(User.email == normalized_email)
        res = await self.db.execute(query)
        if res.scalar_one_or_none():
            raise ValidationException("An account with this email address already exists.")

        user = User(
            email=normalized_email,
            password_hash=hash_password(req.password),
            display_name=req.display_name.strip(),
            role="USER",
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()

        # Issue tokens
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id)

        token_record = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(refresh_token),
            expires_at=datetime.fromtimestamp(
                decode_token(refresh_token)["exp"], tz=timezone.utc
            ),
        )
        self.db.add(token_record)

        audit = AuditLog(
            actor_user_id=user.id,
            action="USER_REGISTER",
            resource_type="user",
            resource_id=user.id,
            sanitized_metadata={"email": normalized_email}
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(user)

        return user, access_token, refresh_token

    async def login(self, req: UserLoginRequest) -> Tuple[User, str, str]:
        normalized_email = req.email.lower().strip()
        query = select(User).where(User.email == normalized_email)
        res = await self.db.execute(query)
        user = res.scalar_one_or_none()

        if not user or not verify_password(req.password, user.password_hash):
            raise AuthenticationException("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationException("User account is disabled. Please contact support.")

        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id)

        token_record = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(refresh_token),
            expires_at=datetime.fromtimestamp(
                decode_token(refresh_token)["exp"], tz=timezone.utc
            ),
        )
        self.db.add(token_record)

        audit = AuditLog(
            actor_user_id=user.id,
            action="USER_LOGIN",
            resource_type="user",
            resource_id=user.id,
            sanitized_metadata={"email": normalized_email}
        )
        self.db.add(audit)
        await self.db.commit()

        return user, access_token, refresh_token

    async def refresh_tokens(self, refresh_token: str) -> Tuple[str, str]:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise AuthenticationException("Invalid token type for refresh.")

        user_id = payload.get("sub")
        token_hash = _hash_token(refresh_token)

        query = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked.is_(False)
        )
        res = await self.db.execute(query)
        stored_token = res.scalar_one_or_none()

        if not stored_token:
            raise AuthenticationException("Refresh token is invalid or has been revoked.")

        # Revoke current refresh token (rotation policy)
        stored_token.is_revoked = True

        # Fetch user
        user_res = await self.db.execute(select(User).where(User.id == user_id, User.is_active.is_(True)))
        user = user_res.scalar_one_or_none()
        if not user:
            raise AuthenticationException("User not found or account is disabled.")

        new_access_token = create_access_token(subject=user.id, role=user.role)
        new_refresh_token = create_refresh_token(subject=user.id)

        new_token_record = RefreshToken(
            user_id=user.id,
            token_hash=_hash_token(new_refresh_token),
            expires_at=datetime.fromtimestamp(
                decode_token(new_refresh_token)["exp"], tz=timezone.utc
            ),
        )
        self.db.add(new_token_record)
        await self.db.commit()

        return new_access_token, new_refresh_token

    async def logout(self, refresh_token: str) -> None:
        token_hash = _hash_token(refresh_token)
        query = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        res = await self.db.execute(query)
        token = res.scalar_one_or_none()
        if token:
            token.is_revoked = True
            await self.db.commit()
