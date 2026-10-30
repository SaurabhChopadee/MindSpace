# MindSpace — AI-Powered Mental Health & Clinical Review Platform

MindSpace is a full-stack mental health sanctuary and clinical intelligence platform built with **Next.js 16**, **Google Cloud Firestore**, **Firebase Authentication**, **Google Gemini 3.5**, and a fine-tuned **DialoGPT-medium** model.

---

## 🌟 Key Architecture & Features

### 1. Dual-Portal Experience
- **Member Portal (`/patient`)**:
  - Daily mood check-ins with mood intensity tracking and historical trend graphs.
  - Private reflection journal with persistent cloud storage.
  - Empathetic AI Companion with real-time text streaming, sentiment awareness, and memory extraction.
  - Instant crisis detection and triage with emergency lifeline integration (Tele-MANAS, KIRAN).
- **Clinician Portal (`/psychiatrist`)**:
  - Independent Doctor registration and secure login.
  - Real-time caseload monitoring, risk indicators, and mood variability analytics.
  - Clinical AI Decision Support Assistant for patient summary triaging, risk assessment, and session preparation briefs.

### 2. Cloud Database & Authentication
- **Database**: Google Cloud Firestore (Document-oriented NoSQL collections: `users`, `moods`, `journals`, `conversations`, `messages`).
- **Authentication**: Firebase Authentication with role-based access control (RBAC) separating patients and psychiatrists.
- **Session Persistence**: Automated token verification and state hydration across browser sessions.

### 3. Machine Learning & Custom Model Research
- **Custom Model**: Fine-tuned Microsoft DialoGPT-medium on 6,000+ psychotherapy dialogues from CounselChat using PyTorch and Hugging Face Transformers (`mindspace_custom_model/`).
- **Hybrid Deployment**: Low-latency web streaming powered by Gemini 3.5 Flash with built-in clinical fallback generators.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy .env.example to .env.local and set the values described below

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Firebase Setup

Set the `NEXT_PUBLIC_FIREBASE_*` values from the Web app configuration in Firebase Console > Project settings > Your apps. The project ID must be `mindspace-790be`. Enable Email/Password authentication and create a Cloud Firestore database for that same project. Do not put a service-account JSON or private key in the browser config or any `NEXT_PUBLIC_*` variable; server credentials belong only in a server-side secret store.

To verify client writes, sign in to the app, create a mood check-in and a journal entry, then check the `moods` and `journals` collections in the Firestore console for documents with your user ID. Firestore Security Rules must allow the signed-in user to write their own records.

---

## 🧪 Validation & Testing

```bash
# Linting & code standards
npm run lint

# Production compilation check
npm run build
```

---

## 📂 Key Project Directories

- `app/` — Next.js 16 App Router pages and API routes (`/api/chat`, `/api/clinical-ai`).
- `components/` — Modular UI components for Member and Clinician experiences.
- `lib/` — Firebase initialization (`firebase.ts`), backend data layer (`backend-api.ts`), and AI logic (`ai-service.ts`).
- `mindspace_custom_model/` — Fine-tuned PyTorch / Hugging Face model weights (`model.safetensors`) and loss curve.
- `model_training/` — Python training scripts and Google Colab notebooks.

