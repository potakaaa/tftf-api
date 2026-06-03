import json
import os
import subprocess
from pathlib import Path
from collections.abc import Iterator

from app.core.config import settings
from app.schemas.graph import GraphBuildRequest


class GraphBuildServiceError(RuntimeError):
    """Raised when the native graph builder cannot stream a usable result."""


def _graph_builder_filename(platform_name: str = os.name) -> str:
    return "tftf_graph_builder.exe" if platform_name == "nt" else "tftf_graph_builder"


def _validate_runner(runner_dir: Path, runner_path: Path) -> None:
    if not runner_dir.is_dir():
        raise GraphBuildServiceError(f"Native runner directory does not exist: {runner_dir}")
    if not runner_path.is_file():
        raise GraphBuildServiceError(
            f"Native graph builder is missing: {runner_path}. Run `pnpm native:build` from the repository root."
        )


def stream_graph_build(request: GraphBuildRequest) -> Iterator[str]:
    runner_dir = settings.runner_dir.resolve()
    runner_path = runner_dir / "bin" / _graph_builder_filename()
    _validate_runner(runner_dir, runner_path)

    payload: dict[str, object] = {"transfer_range": request.transfer_range}
    if request.graph_path is not None:
        payload["graph_path"] = request.graph_path
    if request.output_path is not None:
        payload["output_path"] = request.output_path
    if request.geojson_data is not None:
        payload["geojson_data"] = request.geojson_data

    process = subprocess.Popen(
        [str(runner_path)],
        cwd=runner_dir,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    assert process.stdin is not None
    assert process.stdout is not None
    assert process.stderr is not None

    process.stdin.write(f"{json.dumps(payload)}\n")
    process.stdin.close()

    for line in process.stdout:
        stripped_line = line.strip()
        if not stripped_line:
            continue
        yield f"{stripped_line}\n"

    stderr_output = process.stderr.read().strip()
    return_code = process.wait()

    if return_code != 0:
        message = stderr_output or f"Native graph builder exited with code {return_code}"
        yield f"{json.dumps({'type': 'error', 'message': message})}\n"
