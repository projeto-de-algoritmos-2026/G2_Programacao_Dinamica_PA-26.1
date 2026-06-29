from fastapi import APIRouter

from algorithms.longest_increasing_subsequence import (
    longest_increasing_subsequence
)

from schemas import (
    LISRequest,
    LISResponse
)

router = APIRouter()


@router.post(
    "/solve",
    response_model=LISResponse
)
def solve_lis(
    request: LISRequest
):

    length = longest_increasing_subsequence(request)

    return LISResponse(
        length=length
    )