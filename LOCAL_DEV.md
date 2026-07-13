# Local Development Notes

## Career Agent Backend

For the current app flow, run the Career Agent backend from:

```text
/Users/charlesd/Developer/active/vetpivot-career-agent
```

Start it on port `8000`:

```bash
export GEMINI_API_KEY=your_gemini_key
PYTHONPATH=src python3 -m uvicorn vetpivot.api:app --host 127.0.0.1 --port 8000
```

Then point the frontend at it:

```bash
export VITE_CAREER_AGENT_API_URL=http://127.0.0.1:8000
npm run dev
```

In production, leave `VITE_CAREER_AGENT_API_URL` unset. Firebase Hosting rewrites `/api/career-agent` to the `vetpivot-career-agent` Cloud Run service.

## O*NET Credentials
Set the HTTPS username and password that the backend will use when O*NET lookups are enabled:

```bash
export ONET_USER=your_onet_username
export ONET_PASS=your_onet_password
```

Or drop them into a `.env` file at the workspace root (the backend already loads it via `python-dotenv`).

## Legacy Translation Backend

The older `/api/translate` flow expects the legacy backend on port `8080`:

1. Start the legacy backend API:
   ```bash
   pip install -r backend/requirements.txt
   uvicorn backend.main:app --reload --port 8080
   ```
2. In another terminal, start the frontend:
   ```bash
   npm install
   npm run dev
   ```

## Verification URLs
- Career Agent health: `http://127.0.0.1:8000/health`
- Frontend experience: `http://localhost:3000`
- Legacy O*NET check: `http://localhost:8080/api/onet/search?keyword=infantry`
