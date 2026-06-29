from fastapi import APIRouter

from algorithms.sequence_alignment import (
    sequence_alignment
)

from schemas import (
    SequenceAlignmentRequest,
    SequenceAlignmentResponse
)

router = APIRouter()


@router.post(
    "/solve",
    response_model=SequenceAlignmentResponse
)
def solve_sequence_alignment(
    request: SequenceAlignmentRequest
):

    score = sequence_alignment(request)

    return SequenceAlignmentResponse(
        alignment_score=score
    )