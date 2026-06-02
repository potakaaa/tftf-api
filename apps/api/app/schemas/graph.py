from pydantic import BaseModel, ConfigDict, Field


class GraphBuildRequest(BaseModel):
    graph_path: str | None = None
    output_path: str | None = None
    geojson_data: dict | None = None
    transfer_range: float = Field(default=300.0, gt=0)


class GraphBuildProgress(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str
    stage: str
    completed: int
    total: int
    message: str


class GraphBuildCompleted(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str
    graph_path: str | None = None
    graph_data: dict | None = None
    route_count: int
    edge_count: int


class GraphBuildError(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str
    message: str
