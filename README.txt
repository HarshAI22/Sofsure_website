SOFSURE WEBSITE — ENHANCED BUILD
================================

What's included
---------------
- Refined responsive HTML/CSS visuals with a restrained technology aesthetic.
- Careers page with searchable/filterable roles and role detail dialogs.
- Working application form connected to a FastAPI endpoint.
- SQLite database for application records and private PDF resume storage.
- Server-side validation for role, contact fields, PDF signature and 5 MB limit.

Run locally (Windows)
---------------------
1. Install Python 3.10 or newer.
2. Open this project folder in Terminal / PowerShell.
3. Create and activate a virtual environment:
   py -m venv .venv
   .venv\Scripts\activate
4. Install dependencies:
   pip install -r requirements.txt
5. Start the website and API together:
   uvicorn backend.main:app --reload
6. Open http://127.0.0.1:8000
7. Check API health at http://127.0.0.1:8000/api/health

Application endpoint
--------------------
POST /api/applications (multipart/form-data)
Fields: role, name, email, phone, portfolio (optional), message, resume (PDF).

Storage
-------
Application records: private_data/applications.sqlite3
Resumes: private_data/resumes/ (not served as public website files)
Set SOFSURE_DATA_DIR to a persistent private directory before deployment.

Important before going live
---------------------------
- The database is SQLite for a simple first deployment. For a multi-instance or
  higher-volume production setup, migrate to managed PostgreSQL.
- Add HTTPS, a privacy notice/retention policy, spam protection/rate limiting,
  backups, monitoring and an authenticated HR-only application review workflow.
- Keep private_data outside any public/static hosting directory and restrict
  filesystem access. Do not commit or publicly expose candidate records/resumes.
- Configure a persistent disk for SOFSURE_DATA_DIR; ephemeral hosting disks can
  erase applications and uploaded resumes on redeploy.
- Verify company contact details, role descriptions, dates and compensation.
- The role descriptions and draft marketing copy remain subject to Sofsure approval.

The site is served by FastAPI so the form and API share the same origin. Do not
open the HTML via file:// or use Live Server for the working application form.
