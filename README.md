# VetPivot Resume Optimizer — Frontend (React + Vite)

Part of the VetPivot Resume Optimizer: a tool that translates military bullets into clear, civilian-ready resume lines.

## 🖥️ Tech Stack
- React (Vite)
- Firebase Hosting
- TailwindCSS (optional)
- FastAPI backend (Google Cloud Run)
- Gemini API (Google AI Studio)

## 🚀 Commands
```bash
npm install
npm run dev
npm run build
```

## 🔌 API Connection
Main Career Agent API:

```bash
VITE_CAREER_AGENT_API_URL=http://127.0.0.1:8000
```

Leave `VITE_CAREER_AGENT_API_URL` unset in production. Firebase Hosting rewrites same-origin `/api/career-agent` to the `vetpivot-career-agent` Cloud Run service.

Legacy translation API:

```bash
VITE_API_URL=https://vetpivot-backend-796137818435.us-central1.run.app
```

The main app flow now uses `/api/career-agent`; `/api/translate` is secondary/legacy.

## 🎯 Purpose
This frontend delivers a simple, fast UI for:
- entering bullets
- receiving clean translations
- previewing resume-ready text

## 🔗 Related Repos
Backend API → https://github.com/CharlesDdev/vetpivot-backend

## 📬 Contact
X: @VetPivot  
GitHub: CharlesDdev
