from __future__ import annotations

import os
from typing import Tuple

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SEARCH_URL = "https://services.onetcenter.org/ws/online/search"


def get_onet_credentials() -> Tuple[str, str]:
    user = os.getenv("ONET_USER")
    password = os.getenv("ONET_PASS")
    if not user or not password:
        raise HTTPException(status_code=500, detail="O*NET credentials are not configured")
    return user, password


@app.get("/api/onet/search")
async def search_onet(keyword: str = Query("infantry", min_length=1)) -> dict:
    user, password = get_onet_credentials()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                SEARCH_URL,
                params={"keyword": keyword},
                auth=(user, password),
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch O*NET data (status {exc.response.status_code})",
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Unable to reach O*NET: {exc}")

    try:
        return response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Unexpected O*NET response format")
