from datetime import datetime, timezone
from typing import List, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AccessForbiddenException, EntityNotFoundException
from app.models.project import Project
from app.schemas.project import ProjectCreateRequest, ProjectUpdateRequest


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, owner_id: str, req: ProjectCreateRequest) -> Project:
        project = Project(
            owner_id=owner_id,
            title=req.title.strip(),
            description=req.description.strip() if req.description else None,
            metadata_json=req.metadata_json or {},
            status="ACTIVE",
        )
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def list(
        self, owner_id: str, skip: int = 0, limit: int = 50, include_archived: bool = False
    ) -> Tuple[List[Project], int]:
        filters = [Project.owner_id == owner_id, Project.deleted_at.is_(None)]
        if not include_archived:
            filters.append(Project.status == "ACTIVE")

        count_query = select(func.count(Project.id)).where(*filters)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(Project)
            .where(*filters)
            .order_by(Project.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        res = await self.db.execute(query)
        items = list(res.scalars().all())
        return items, total

    async def get_by_id(self, project_id: str, owner_id: str) -> Project:
        query = select(Project).where(
            Project.id == project_id,
            Project.deleted_at.is_(None)
        )
        res = await self.db.execute(query)
        project = res.scalar_one_or_none()

        if not project:
            raise EntityNotFoundException("Project", project_id)

        if project.owner_id != owner_id:
            raise AccessForbiddenException("You do not have permission to access this project.")

        return project

    async def update(self, project_id: str, owner_id: str, req: ProjectUpdateRequest) -> Project:
        project = await self.get_by_id(project_id, owner_id)

        if req.title is not None:
            project.title = req.title.strip()
        if req.description is not None:
            project.description = req.description.strip()
        if req.status is not None:
            project.status = req.status
        if req.metadata_json is not None:
            project.metadata_json = req.metadata_json

        project.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete(self, project_id: str, owner_id: str) -> bool:
        project = await self.get_by_id(project_id, owner_id)
        # Soft delete
        project.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
        return True
