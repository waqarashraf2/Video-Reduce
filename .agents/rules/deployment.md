# Deployment Architecture Rules

## 1. Domain Separation
- **Frontend (Next.js)**:
  - Deploys ONLY to the primary web root (`public_html/` or `domains/videoreduce.com/public_html/`).
  - Contains ONLY the static export files from `out/`.
  - NEVER copy or deploy `api/` (Laravel backend) to the main frontend directory.

- **Backend (Laravel API)**:
  - Deploys ONLY to the subdomain target: `domains/api.videoreduce.com/public_html/`.
  - NEVER mix backend code into the frontend root.

## 2. File Safety & Preservation
- NEVER use `rsync --delete` on any production directory.
- Only upload new or modified files.
- ALWAYS protect `.env`, `.env.*`, `vendor/`, `node_modules/`, `storage/`, and database files.
- NEVER delete or overwrite `.env` created by the user on the server.
