from fastapi import APIRouter

from algorithms.knapsack import knapsack
from schemas import (
    KnapsackRequest,
    KnapsackResponse
)

router = APIRouter()


@router.post(
    "/solve",
    response_model=KnapsackResponse
)
def solve_knapsack(
    request: KnapsackRequest
):

    optimum = knapsack(request)

    return KnapsackResponse(
        maximum_value=optimum
    )