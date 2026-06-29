from schemas import SequenceAlignmentRequest
from utils import initialize_matrix


def sequence_alignment(
    request: SequenceAlignmentRequest
) -> int:
    """
    Computes the optimal alignment score between two sequences
    using Bottom-Up Dynamic Programming.

    Parameters
    ----------
    request : SequenceAlignmentRequest

    Returns
    -------
    int
        Optimal alignment score.
    """

    sequence1 = request.sequence1
    sequence2 = request.sequence2

    match = request.match_score
    mismatch = request.mismatch_penalty
    gap = request.gap_penalty

    rows = len(sequence1)
    columns = len(sequence2)

    dp = initialize_matrix(rows + 1, columns + 1)

    # Base cases
    for i in range(rows + 1):
        dp[i][0] = i * gap

    for j in range(columns + 1):
        dp[0][j] = j * gap

    # Fill DP table
    for i in range(1, rows + 1):

        for j in range(1, columns + 1):

            if sequence1[i - 1] == sequence2[j - 1]:
                diagonal = dp[i - 1][j - 1] + match
            else:
                diagonal = dp[i - 1][j - 1] + mismatch

            up = dp[i - 1][j] + gap
            left = dp[i][j - 1] + gap

            dp[i][j] = max(
                diagonal,
                up,
                left
            )

    return dp[rows][columns]