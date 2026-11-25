"""Sofsure careers API. Run from the project root with: uvicorn backend.main:app --reload"""
from __future__ import annotations

import os
import re
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("SOFSURE_DATA_DIR", ROOT / "private_data")).resolve()
RESUME_DIR = DATA_DIR / "resumes"
DB_PATH = DATA_DIR / "applications.sqlite3"
MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_ROLES = {
    "Political Research Intern", "UI/UX Design Intern", "AI Engineering Intern",
    "Full Stack Engineering Intern", "Data Science Intern",
}

DATA_DIR.mkdir(parents=True, exist_ok=True)
RESUME_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Sofsure Careers API", version="1.0.0")


def connect_db() -> sqlite3.Connection:
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


with connect_db() as db:
    db.execute("""CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        portfolio TEXT,
        message TEXT NOT NULL,
        resume_path TEXT NOT NULL
    )""")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Sofsure Careers API"}


@app.post("/api/applications", status_code=201)
async def submit_application(
    request: Request,
    role: Annotated[str, Form()],
    name: Annotated[str, Form()],
    email: Annotated[str, Form()],
    phone: Annotated[str, Form()],
    message: Annotated[str, Form()],
    portfolio: Annotated[str, Form()] = "",
    resume: UploadFile = File(...),
):
    # Keep validation server-side; browser validation is only a convenience.
    name, email, phone, message = name.strip(), email.strip().lower(), phone.strip(), message.strip()
    if role not in ALLOWED_ROLES:
        raise HTTPException(400, "Please select a valid open position.")
    if not (2 <= len(name) <= 120):
        raise HTTPException(400, "Please enter your full name.")
    if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(400, "Please enter a valid email address.")
    if not re.fullmatch(r"[+0-9() .-]{7,25}", phone):
        raise HTTPException(400, "Please enter a valid phone number.")
    if not (10 <= len(message) <= 5000):
        raise HTTPException(400, "Introduction must be between 10 and 5,000 characters.")
    if portfolio and (len(portfolio) > 500 or not portfolio.startswith(("https://", "http://"))):
        raise HTTPException(400, "Portfolio must be a valid http(s) URL.")
    if resume.content_type != "application/pdf" or not (resume.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Resume must be a PDF file.")

    payload = await resume.read(MAX_RESUME_BYTES + 1)
    if len(payload) > MAX_RESUME_BYTES:
        raise HTTPException(413, "Resume must be 5 MB or smaller.")
    if not payload.startswith(b"%PDF-"):
        raise HTTPException(400, "The uploaded file does not appear to be a valid PDF.")

    application_id = "SF-" + secrets.token_hex(5).upper()
    stored_name = f"{application_id}.pdf"
    destination = RESUME_DIR / stored_name
    destination.write_bytes(payload)
    created_at = datetime.now(timezone.utc).isoformat()
    try:
        with connect_db() as db:
            db.execute("""INSERT INTO applications
                (id, created_at, role, name, email, phone, portfolio, message, resume_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (application_id, created_at, role, name, email, phone, portfolio.strip(), message,
                 str(destination)))
    except Exception:
        destination.unlink(missing_ok=True)
        raise HTTPException(500, "We couldn't save your application. Please try again.")
    return {"ok": True, "application_id": application_id, "message": "Application received."}


# Serve the existing static website from the same origin as the API.
app.mount("/", StaticFiles(directory=ROOT, html=True, check_dir=True), name="website")
