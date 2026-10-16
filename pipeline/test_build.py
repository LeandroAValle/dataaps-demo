import csv
from pathlib import Path

import pytest

from pipeline.build import build, load_rows
from pipeline.generate import generate


def test_pipeline_is_reproducible_and_consistent(tmp_path: Path) -> None:
    source = tmp_path / "people.csv"
    output = tmp_path / "dashboard.json"
    generate(source)
    first = build(source, output)
    first_bytes = output.read_bytes()
    generate(source)
    build(source, output)
    assert output.read_bytes() == first_bytes
    assert first["teams"]["Todas as equipes"]["summary"]["metrics"]["people_followed"] == 1200
    assert sum(first["teams"][team]["summary"]["metrics"]["people_followed"] for team in list(first["teams"])[1:]) == 1200


def test_duplicate_identifier_is_rejected(tmp_path: Path) -> None:
    source = tmp_path / "people.csv"
    generate(source)
    with source.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.reader(handle))
    rows.append(rows[1])
    with source.open("w", encoding="utf-8", newline="") as handle:
        csv.writer(handle).writerows(rows)
    with pytest.raises(ValueError, match="duplicado"):
        load_rows(source)
