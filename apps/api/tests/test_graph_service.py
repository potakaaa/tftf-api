import io
import json
import subprocess
from pathlib import Path

import pytest

from app.core.config import settings
from app.schemas.graph import GraphBuildRequest
from app.services.graph_service import GraphBuildServiceError, stream_graph_build


class FakeStdin:
    def __init__(self) -> None:
        self.buffer = ""
        self.closed = False

    def write(self, text: str) -> int:
        self.buffer += text
        return len(text)

    def close(self) -> None:
        self.closed = True


class FakeProcess:
    def __init__(self, stdout_lines: list[str], stderr_text: str = "", return_code: int = 0) -> None:
        self.stdin = FakeStdin()
        self.stdout = iter(stdout_lines)
        self.stderr = io.StringIO(stderr_text)
        self._return_code = return_code

    def wait(self) -> int:
        return self._return_code


@pytest.fixture
def graph_runner_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    runner_path = tmp_path / "bin" / "tftf_graph_builder"
    runner_path.parent.mkdir()
    runner_path.touch()
    monkeypatch.setattr(settings, "runner_dir", tmp_path)
    return tmp_path


def test_stream_graph_build_forwards_progress_events(
    graph_runner_dir: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    native_stdout = [
        json.dumps({
            "type": "progress",
            "stage": "generate_transfers",
            "completed": 1,
            "total": 2,
            "message": "Scanning route transfer candidates",
        }) + "\n",
        json.dumps({
            "type": "completed",
            "graph_path": "data/graph.json",
            "route_count": 2,
            "edge_count": 7,
        }) + "\n",
    ]

    fake_process = FakeProcess(native_stdout)

    def popen_stub(*args, **kwargs) -> FakeProcess:
        assert kwargs["cwd"] == graph_runner_dir
        assert args[0][0].endswith("tftf_graph_builder")
        return fake_process

    monkeypatch.setattr(subprocess, "Popen", popen_stub)

    request = GraphBuildRequest(
        graph_path="data/graph.json",
        output_path="data/generated.json",
        transfer_range=250.0,
    )

    events = list(stream_graph_build(request))

    assert json.loads(fake_process.stdin.buffer) == {
        "graph_path": "data/graph.json",
        "output_path": "data/generated.json",
        "transfer_range": 250.0,
    }
    assert fake_process.stdin.closed is True
    assert len(events) == 2
    assert json.loads(events[0]) == {
        "type": "progress",
        "stage": "generate_transfers",
        "completed": 1,
        "total": 2,
        "message": "Scanning route transfer candidates",
    }
    assert json.loads(events[1]) == {
        "type": "completed",
        "graph_path": "data/graph.json",
        "route_count": 2,
        "edge_count": 7,
    }


def test_stream_graph_build_reports_missing_runner(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(settings, "runner_dir", tmp_path)

    with pytest.raises(GraphBuildServiceError, match="Native graph builder is missing"):
        list(stream_graph_build(GraphBuildRequest()))
