from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_summary_matches_synthetic_snapshot() -> None:
    response = client.get("/api/v1/dashboard/summary", params={"team": "Equipe Norte"})
    assert response.status_code == 200
    assert response.json()["source"] == "synthetic"
    assert response.json()["metrics"]["people_followed"] == 400


def test_unknown_team_is_rejected() -> None:
    response = client.get("/api/v1/dashboard/summary", params={"team": "Outra equipe"})
    assert response.status_code == 400


def test_api_exposes_only_synthetic_context() -> None:
    assert client.get("/health").json() == {"status": "ok", "source": "synthetic"}
    assert client.get("/api/v1/context").json()["schema_version"] == 1
