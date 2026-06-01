from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.graph import GraphBuildRequest
from app.services.graph_service import GraphBuildServiceError, stream_graph_build

router = APIRouter(prefix="/api/graphs", tags=["graphs"])


@router.post("/rebuild")
def rebuild_graph(request: GraphBuildRequest) -> StreamingResponse:
    # TODO: In the future, once the user uploads their own GeoJSON and the graph is
    # built dynamically via stream_graph_build(), intercept or pipe this response
    # and save the resulting graph_data to a cloud blob store (like S3) or a database.
    try:
        return StreamingResponse(
            stream_graph_build(request),
            media_type="application/x-ndjson",
        )
    except GraphBuildServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
