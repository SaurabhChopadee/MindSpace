# MindSpace Demo Guide

## Current progress

MindSpace is currently a working full-stack prototype:

- Modern Next.js frontend with patient and psychiatrist experiences
- Mood check-in and trends
- Journal and self-care resources
- AI companion demo chat
- Crisis-support messaging
- Animated calming visual scenes and ambient sound
- Psychiatrist dashboard and patient list
- Clinician patient overview, reports, and alerts
- Patient invitation flow in the demo UI
- FastAPI backend foundation
- JWT authentication and Argon2 password hashing
- MySQL-ready SQLAlchemy models
- Patient-owned mood, journal, conversation, and message API routes
- Explicit psychiatrist-patient relationship authorization

## Start the frontend demo

From the project root:

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

Recommended demonstration order:

1. Open the landing page and explain the two roles.
2. Choose the patient experience.
3. Open the patient dashboard.
4. Select an emoji mood and show the trend update.
5. Open Mood and save a detailed check-in.
6. Open Journal and create an entry.
7. Open Resources and switch between cherry blossom, golden evening, and quiet waves scenes.
8. Open the companion chat and send a message.
9. Return to the landing page and choose Psychiatrist.
10. Use the demo clinician login and open the dashboard.
11. Open Patients and demonstrate search plus Add patient.
12. Open a patient overview to show trends, alerts, reports, and the non-diagnostic AI summary.

## Backend demo

The backend is in `backend/` and is not yet connected to the frontend by default.

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
$env:PYTHONPATH = (Get-Location).Path
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs to show the API documentation.

The liveness endpoint is available at http://localhost:8000/api/v1/health. The database health endpoint requires a running MySQL database.

## Honest project status

This is a college project prototype, not a production clinical system. The frontend still uses fictional in-memory data. The backend foundation is implemented, but MySQL migrations, production deployment, real Gemini integration, consent workflows, crisis escalation, audit logging, and full frontend API integration remain future work.

Do not present the AI summaries as diagnoses. They are supportive, derived signals for clinician review only.
