import json
import subprocess
from pathlib import Path

import pytest

from app.core.config import settings
from app.schemas.route import RouteRequest
from app.services.route_service import RouteServiceError, _runner_filename, get_route


@pytest.fixture
def route_request() -> RouteRequest:
    return RouteRequest(
        from_lat=8.50881,
        from_long=124.64827,
        from_name="Bonbon",
        to_lat=8.51133,
        to_long=124.62429,
        to_name="Westbound Bulua Terminal",
        trans_meter=100.5,
        hour=10,
    )


@pytest.fixture
def runner_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    runner_path = tmp_path / "bin" / "tftf_runner"
    runner_path.parent.mkdir()
    runner_path.touch()
    monkeypatch.setattr(settings, "runner_dir", tmp_path)
    return tmp_path


def test_get_route_adapts_native_response(
    route_request: RouteRequest,
    runner_dir: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    native_response = {
        "total_fare": 24.0,
        "tftf": {
            "found": True,
            "route_segments": [
                {
                    "route_id": 8,
                    "route_name": "Bonbon - Cogon",
                    "coordinates": [
                        {"lat": 8.50881, "lon": 124.64827},
                        {"lat": 8.50302, "lon": 124.64268},
                    ],
                },
                {
                    "route_id": 7,
                    "route_name": "Bulua - Cogon",
                    "coordinates": [
                        {"lat": 8.50304, "lon": 124.64245},
                        {"lat": 8.51133, "lon": 124.62429},
                    ],
                },
            ],
        },
    }

    def run_stub(*args, **kwargs) -> subprocess.CompletedProcess[str]:
        assert kwargs["cwd"] == runner_dir
        assert json.loads(kwargs["input"]) == {
            "start": {"lat": 8.50881, "lon": 124.64827},
            "end": {"lat": 8.51133, "lon": 124.62429},
        }
        return subprocess.CompletedProcess(
            args=args,
            returncode=0,
            stdout=f"Graph loaded from data/graph.json\n{json.dumps(native_response)}\n",
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", run_stub)

    response = get_route(route_request)

    assert response.routes[0].route_id == 8
    assert response.routes[0].entry_coordinate == (8.50881, 124.64827)
    assert response.routes[1].exit_coordinate == (8.51133, 124.62429)
    assert response.transfer_range == 100.5


def test_get_route_reports_missing_runner(
    route_request: RouteRequest,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(settings, "runner_dir", tmp_path)

    with pytest.raises(RouteServiceError, match="Native runner is missing"):
        get_route(route_request)


def test_runner_filename_uses_exe_on_windows() -> None:
    assert _runner_filename("nt") == "tftf_runner.exe"
    assert _runner_filename("posix") == "tftf_runner"
