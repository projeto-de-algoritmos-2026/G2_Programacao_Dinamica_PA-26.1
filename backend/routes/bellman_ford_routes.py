from fastapi import APIRouter, HTTPException

from algorithms.bellman_ford import bellman_ford
from schemas import (
    BellmanFordRequest,
    BellmanFordResponse
)

router = APIRouter()


@router.post(
    "/solve",
    response_model=BellmanFordResponse
)
def solve_bellman_ford(
    request: BellmanFordRequest
):

    try:

        distances, negative_cycle = bellman_ford(request)

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc)
        )

    return BellmanFordResponse(
        distances=distances,
        negative_cycle=negative_cycle
    )