"""Validate synthetic source rows and publish the dashboard snapshot."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "raw" / "people_synthetic.csv"
OUTPUT = ROOT / "web" / "public" / "dashboard.json"
TEAMS = ("Todas as equipes", "Equipe Centro", "Equipe Norte", "Equipe Sul")
OPPORTUNITY_LABELS = {
    "prenatal": ("Pré-natal sem consulta recente", "Saúde da mulher", "Revisar histórico de acompanhamento"),
    "vaccine": ("Vacinação com registro pendente", "Imunização", "Revisar esquema e registro"),
    "quality": ("Cadastro com inconsistências", "Qualidade dos dados", "Validar campos essenciais"),
}


def load_rows(path: Path = SOURCE) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise ValueError("Fonte vazia")
    ids: set[str] = set()
    for row in rows:
        identifier = row["synthetic_id"]
        if not identifier.startswith("SYN-") or identifier in ids:
            raise ValueError(f"Identificador sintético inválido ou duplicado: {identifier}")
        ids.add(identifier)
        if row["team"] not in TEAMS[1:]:
            raise ValueError(f"Equipe inválida: {row['team']}")
        if len(row["follow_up_history"]) != 12 or set(row["follow_up_history"]) - {"0", "1"}:
            raise ValueError(f"Histórico inválido: {identifier}")
        if row["essential_fields_complete"] not in {"0", "1"}:
            raise ValueError(f"Qualidade inválida: {identifier}")
        if row["opportunity"] not in {"", "prenatal", "vaccine"}:
            raise ValueError(f"Oportunidade inválida: {identifier}")
    return rows


def summarize(rows: list[dict[str, str]], team: str) -> dict:
    selected = rows if team == TEAMS[0] else [row for row in rows if row["team"] == team]
    total = len(selected)
    trend = [round(sum(row["follow_up_history"][month] == "1" for row in selected) / total * 100, 1) for month in range(12)]
    incomplete = sum(row["essential_fields_complete"] == "0" for row in selected)
    opportunity_counts = Counter(row["opportunity"] for row in selected)
    opportunity_counts["quality"] = incomplete
    opportunities = [
        {"id": key, "title": title, "group": group, "count": opportunity_counts[key], "reason": reason}
        for key, (title, group, reason) in OPPORTUNITY_LABELS.items()
    ]
    metrics = {
        "people_followed": total,
        "units_and_teams": 3 if team == TEAMS[0] else 1,
        "data_inconsistencies": incomplete,
        "care_opportunities": sum(item["count"] for item in opportunities),
        "follow_up_rate": trend[-1],
        "data_quality": round((total - incomplete) / total * 100, 1),
        "follow_up_change": round(trend[-1] - trend[-2], 1),
        "trend": trend,
    }
    return {
        "summary": {"team": team, "period": "2026-09", "source": "synthetic", "source_status": "demo", "rule_status": "illustrative", "last_loaded_at": None, "metrics": metrics},
        "opportunities": opportunities,
    }


def build(source: Path = SOURCE, output: Path = OUTPUT) -> dict:
    rows = load_rows(source)
    result = {"schema_version": 1, "generated_from": "synthetic CSV", "teams": {team: summarize(rows, team) for team in TEAMS}}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


if __name__ == "__main__":
    build()
