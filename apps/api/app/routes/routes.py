from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.schemas.route import RouteRequest, RouteResponse
from app.services.route_service import RouteServiceError, get_route

router = APIRouter(prefix="/api", tags=["routes"])


@router.get("/routes", response_model=RouteResponse, response_model_by_alias=True)
def get_routes(
    from_lat: Annotated[float, Query(alias="fromLat")],
    from_long: Annotated[float, Query(alias="fromLong")],
    from_name: Annotated[str, Query(alias="fromName")],
    to_lat: Annotated[float, Query(alias="toLat")],
    to_long: Annotated[float, Query(alias="toLong")],
    to_name: Annotated[str, Query(alias="toName")],
    trans_meter: Annotated[float, Query(alias="transMeter")],
    hour: Annotated[int, Query()],
) -> RouteResponse:
    request = RouteRequest(
        from_lat=from_lat,
        from_long=from_long,
        from_name=from_name,
        to_lat=to_lat,
        to_long=to_long,
        to_name=to_name,
        trans_meter=trans_meter,
        hour=hour,
    )
    try:
        return get_route(request)
    except RouteServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
