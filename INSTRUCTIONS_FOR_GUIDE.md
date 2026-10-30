# MindSpace — AI-Powered Mental Health Platform
## Project Submission & Execution Guide

---

### 🌐 Quickest Way: View the Live Deployed Application
The application is deployed and hosted live on production cloud infrastructure:
👉 **Live URL:** [https://ai-mental-health-chatbot-kappa.vercel.app](https://ai-mental-health-chatbot-kappa.vercel.app)

*You can open this URL directly in any browser on your laptop, phone, or tablet without installing anything.*

---

### 💻 Running the Project Locally (3 Simple Steps)

If you would like to run and test the source code locally on your machine:

#### Prerequisites:
- [Node.js](https://nodejs.org/) (version 18 or newer installed)

#### Step 1: Open Terminal in this Folder
Open your terminal (PowerShell, Command Prompt, or Terminal) in this extracted project directory.

#### Step 2: Install Dependencies
Download the project dependencies (this takes ~30 seconds):
```bash
npm install
```

#### Step 3: Start the Development Server
```bash
npm run dev
```

Now open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

### 🔑 Demo Accounts for Testing
- **Member Portal:**
  - Create a new account or log in with any email to experience the conversational AI Companion, daily mood tracking, guided breathing/grounding, and wellness journals.
- **Clinician Portal:**
  - Navigate to `/psychiatrist` or click **Clinician Login** on the landing page.
  - Review connected member telemetry, longitudinal mood charts, AI-generated SOAP notes, and clinical decision support.

---

### 📂 Included Project Materials
- **`app/`**: Next.js App Router (Patient screens, Clinician portal, and server-side Gemini streaming API routes).
- **`components/`**: Modular UI components, interactive mood visualization charts, and calming sensory scenes.
- **`lib/`**: Cloud Firebase authentication & Firestore database syncing, clinical state management, and AI prompt engineering.
- **`model_training/`**: Jupyter Notebook (`MindSpace_Model_Training_Colab.ipynb`) for model fine-tuning and evaluation.
- **`Project_Ai-Bot_ppt.01.pptx`**: Project presentation slide deck for review.
