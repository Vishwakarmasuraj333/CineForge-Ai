# CineForge AI — Security Architecture & Hardening Guide

## 1. Authentication & Session Security
- **Bcrypt Password Hashing:** User passwords are encrypted with individual cryptographic salts and 12-round work factor. Plaintext passwords are never logged or stored.
- **JWT Token Pair Strategy:**
  - Short-lived Access Tokens (30 minutes expiry) for minimal attack surface.
  - Refresh Tokens (7 days expiry) stored as SHA-256 hashes in database.
  - **Token Rotation Policy:** Each refresh request revokes the prior refresh token and issues a new pair, immediately detecting and mitigating replay attacks.

---

## 2. Authorization & Tenant Isolation
- Every API endpoint resolving `projects`, `generations`, or `assets` enforces an ownership check:
  `WHERE owner_id == current_user.id`
- Cross-tenant access attempts immediately trigger HTTP 403 Forbidden responses and generate security audit log entries.
- Administrative routes (`/admin/*`) strictly require `current_user.role == "ADMIN"`.

---

## 3. Media Upload & Processing Security
1. **Magic Bytes Validation:** Uploaded files are inspected for their actual binary signatures (`\x89PNG`, `\xff\xd8\xff`, `ftypmp4`), preventing executable files disguised with arbitrary extensions.
2. **Pillow Verification:** Images are decoded and verified in memory via `Image.open().verify()` to neutralize embedded decompression bombs.
3. **Path Traversal Protection:** Filenames are stripped of relative traversals (`../`, `..\`) and special characters using `sanitize_filename`.
4. **Storage Key Isolation:** Files are stored under dedicated scoped prefixes (`users/{user_id}/images/{uuid}.{ext}`). Private paths and S3 bucket identifiers are never exposed directly to clients.

---

## 4. API Secret Management
- External AI Provider keys (`REPLICATE_API_TOKEN`, `FAL_KEY`, `OPENAI_API_KEY`) reside exclusively in server-side environment configurations.
- `.env` is explicitly ignored in `.gitignore`.
- Error messages sent to clients are sanitized to prevent internal stack trace or credential leakage.
