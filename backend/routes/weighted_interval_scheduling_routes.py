from fastapi import APIRouter

from algorithms.weighted_interval_scheduling import (
    weighted_interval_scheduling
)

from schemas import (
    WeightedIntervalRequest,
    WeightedIntervalResponse
)

router = APIRouter()


@router.post(
    "/solve",
    response_model=WeightedIntervalResponse
)
def solve_weighted_interval(
    request: WeightedIntervalRequest
):

    optimum = weighted_interval_scheduling(request)

    return WeightedIntervalResponse(
        maximum_weight=optimum
    )