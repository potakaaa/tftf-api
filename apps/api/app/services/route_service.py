from app.schemas.route import Destination, Origin, RouteLeg, RouteRequest, RouteResponse


def get_mocked_route(request: RouteRequest) -> RouteResponse:
    # TODO: Replace this mock with the C++ route algorithm subprocess or binding.
    # Keep the conversion to RouteResponse here so HTTP handlers stay transport-only.
    transfer_coordinate = (8.47759, 124.64866)

    return RouteResponse(
        origin=Origin(
            latitude=request.from_lat,
            longitude=request.from_long,
            name=request.from_name,
        ),
        routes=[
            RouteLeg(
                route_id=7,
                route_name="Bonbon (R1) - Cogon Public Market",
                transfer_cost=0.0,
                entry_coordinate=(request.from_lat, request.from_long),
                exit_coordinate=transfer_coordinate,
            ),
            RouteLeg(
                route_id=7,
                route_name="Bulua (R4) - Cogon Public Market",
                transfer_cost=0.0,
                entry_coordinate=transfer_coordinate,
                exit_coordinate=transfer_coordinate,
            ),
            RouteLeg(
                route_id=7,
                route_name="Bulua (R4) - Cogon Public Market",
                transfer_cost=0.0,
                entry_coordinate=transfer_coordinate,
                exit_coordinate=(request.to_lat, request.to_long),
            ),
        ],
        destination=Destination(
            name=request.to_name,
            latitude=request.to_lat,
            longitude=request.to_long,
        ),
        transfer_range=request.trans_meter,
    )
