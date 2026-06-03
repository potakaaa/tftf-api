import json
import os
import subprocess
from pathlib import Path

from pydantic import ValidationError

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.route import (
    Destination,
    NativeRouteResponse,
    NativeRouteSegment,
    Origin,
    RouteLeg,
    RouteRequest,
    RouteResponse,
)

logger = get_logger("tftf.api.routes")


class RouteServiceError(RuntimeError):
    """Raised when the native route runner cannot return a usable route."""


def get_route(request: RouteRequest) -> RouteResponse:
    native_response = _run_native_route(request)
    return _to_route_response(request, native_response)


def _run_native_route(request: RouteRequest) -> NativeRouteResponse:
    runner_dir = settings.runner_dir.resolve()
    runner_path = runner_dir / "bin" / _runner_filename()
    _validate_runner(runner_dir, runner_path)

    payload = {
        "start": {"lat": request.from_lat, "lon": request.from_long},
        "end": {"lat": request.to_lat, "lon": request.to_long},
    }
    if settings.graph_path is not None:
        payload["graph_path"] = str(settings.graph_path)

    try:
        process = subprocess.run(
            [str(runner_path)],
            cwd=runner_dir,
            input=f"{json.dumps(payload)}\n",
            capture_output=True,
            text=True,
            timeout=settings.runner_timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise RouteServiceError("Native route runner timed out") from error
    except OSError as error:
        raise RouteServiceError(f"Unable to start native route runner: {error}") from error

    if process.stderr:
        logger.debug("Native route runner stderr: %s", process.stderr.strip())

    response_data = _parse_last_json_line(process.stdout)
    if response_data is None:
        detail = process.stderr.strip() or f"exit code {process.returncode}"
        raise RouteServiceError(f"Native route runner returned no route: {detail}")

    try:
        return NativeRouteResponse.model_validate(response_data)
    except ValidationError as error:
        raise RouteServiceError("Native route runner returned an invalid response") from error


def _validate_runner(runner_dir: Path, runner_path: Path) -> None:
    if not runner_dir.is_dir():
        raise RouteServiceError(f"Native runner directory does not exist: {runner_dir}")
    if not runner_path.is_file():
        raise RouteServiceError(
            f"Native runner is missing: {runner_path}. "
            "Run `pnpm native:build` from the repository root."
        )


def _runner_filename(platform_name: str = os.name) -> str:
    return "tftf_runner.exe" if platform_name == "nt" else "tftf_runner"


def _parse_last_json_line(output: str) -> dict | None:
    for line in reversed(output.strip().splitlines()):
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


def _to_route_response(
    request: RouteRequest,
    native_response: NativeRouteResponse,
) -> RouteResponse:
    if not native_response.tftf.found or not native_response.tftf.route_segments:
        raise RouteServiceError("Native route runner found no valid route")

    routes = [
        _to_route_leg(segment)
        for segment in native_response.tftf.route_segments
        if segment.coordinates
    ]
    if not routes:
        raise RouteServiceError("Native route runner returned no route segments")

    return RouteResponse(
        origin=Origin(
            latitude=request.from_lat,
            longitude=request.from_long,
            name=request.from_name,
        ),
        routes=routes,
        destination=Destination(
            name=request.to_name,
            latitude=request.to_lat,
            longitude=request.to_long,
        ),
        transfer_range=request.trans_meter,
    )


def _to_route_leg(segment: NativeRouteSegment) -> RouteLeg:
    entry = segment.coordinates[0]
    exit = segment.coordinates[-1]

    return RouteLeg(
        route_id=segment.route_id,
        route_name=segment.route_name,
        transfer_cost=0.0,
        entry_coordinate=(entry.lat, entry.lon),
        exit_coordinate=(exit.lat, exit.lon),
    )
