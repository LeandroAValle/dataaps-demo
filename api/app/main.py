"""Read-only API over the reproducible synthetic dashboard snapshot."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

SNAPSHOT = Path(__file__).resolve().parents[2] / "web" / "public" / "dashboard.json"
app = FastAPI(
    title="DataAPS Demo API",
    version="1.0.0",
    description="API de demonstração. Usa somente dados sintéticos; não acessa sistemas de saúde.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def snapshot() -> dict:
    return json.loads(SNAPSHOT.read_text(encoding="utf-8"))


def for_team(team: str) -> dict:
    teams = snapshot()["teams"]
    if team not in teams:
        raise HTTPException(status_code=400, detail={"message": "Equipe desconhecida", "allowed_teams": list(teams)})
    return teams[team]


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "source": "synthetic"}


@app.get("/api/v1/context", tags=["context"])
def context() -> dict:
    data = snapshot()
    return {"teams": list(data["teams"]), "period": "2026-09", "source": "synthetic", "schema_version": data["schema_version"]}


@app.get("/api/v1/dashboard/summary", tags=["dashboard"])
def dashboard_summary(team: Annotated[str, Query(description="Recorte territorial")]= "Todas as equipes") -> dict:
    return for_team(team)["summary"]


@app.get("/api/v1/opportunities", tags=["dashboard"])
def opportunities(team: Annotated[str, Query(description="Recorte territorial")]= "Todas as equipes") -> list[dict]:
    return for_team(team)["opportunities"]
