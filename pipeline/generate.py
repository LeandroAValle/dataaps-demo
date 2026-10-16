"""Create a reproducible, entirely fictional input dataset."""

from __future__ import annotations

import csv
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "raw" / "people_synthetic.csv"
TEAMS = ("Equipe Centro", "Equipe Norte", "Equipe Sul")
OPPORTUNITIES = ("", "prenatal", "vaccine")


def generate(path: Path = OUTPUT) -> None:
    rng = random.Random(202609)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(("synthetic_id", "team", "follow_up_history", "essential_fields_complete", "opportunity"))
        for number in range(1, 1201):
            team = TEAMS[(number - 1) % len(TEAMS)]
            history = "".join("1" if rng.random() < 0.64 + month * 0.013 else "0" for month in range(12))
            complete = rng.random() < 0.91
            opportunity = rng.choices(OPPORTUNITIES, weights=(78, 9, 13))[0]
            writer.writerow((f"SYN-{number:04d}", team, history, int(complete), opportunity))


if __name__ == "__main__":
    generate()
