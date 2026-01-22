# Local Development Notes

## O*NET Credentials
Set the HTTPS username and password that the FastAPI proxy will use:

```bash
export ONET_USER=your_onet_username
export ONET_PASS=your_onet_password
```

Or drop them into a `.env` file at the workspace root (the backend already loads it via `python-dotenv`).

## Running Locally
1. Start the backend API (default port 8080):
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
- Backend health: `http://localhost:8080/api/onet/search?keyword=infantry`
- Frontend experience (with MOS lookup card): `http://localhost:3000`
