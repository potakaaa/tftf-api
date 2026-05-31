from pydantic import BaseModel, ConfigDict, Field


class RouteRequest(BaseModel):
    from_lat: float
    from_long: float
    from_name: str
    to_lat: float
    to_long: float
    to_name: str
    trans_meter: float
    hour: int


class NativeCoordinate(BaseModel):
    lat: float
    lon: float


class NativeRouteSegment(BaseModel):
    route_id: int
    route_name: str
    coordinates: list[NativeCoordinate]


class NativeTftfResult(BaseModel):
    found: bool
    route_segments: list[NativeRouteSegment]


class NativeRouteResponse(BaseModel):
    total_fare: float
    tftf: NativeTftfResult


class Origin(BaseModel):
    latitude: float = Field(serialization_alias="Lattitude")
    longitude: float = Field(serialization_alias="Longitude")
    name: str = Field(serialization_alias="Origin Name")


class Destination(BaseModel):
    name: str = Field(serialization_alias="Destination Name")
    latitude: float = Field(serialization_alias="Lattitude")
    longitude: float = Field(serialization_alias="Longitude")


class RouteLeg(BaseModel):
    route_id: int = Field(serialization_alias="Route ID")
    route_name: str = Field(serialization_alias="Route Name")
    transfer_cost: float = Field(serialization_alias="Transfer Cost")
    entry_coordinate: tuple[float, float] = Field(
        serialization_alias="Entry Coordinate"
    )
    exit_coordinate: tuple[float, float] = Field(serialization_alias="Exit Coordinate")


class RouteResponse(BaseModel):
    model_config = ConfigDict(serialize_by_alias=True)

    origin: Origin = Field(serialization_alias="From")
    routes: list[RouteLeg] = Field(serialization_alias="Routes")
    destination: Destination = Field(serialization_alias="To")
    transfer_range: float = Field(serialization_alias="Transfer Range")
