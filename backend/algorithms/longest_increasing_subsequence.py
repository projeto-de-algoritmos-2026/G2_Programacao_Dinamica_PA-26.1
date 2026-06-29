from schemas import LISRequest


def longest_increasing_subsequence(
    request: LISRequest
) -> int:
    """
    Computes the length of the Longest Increasing Subsequence (LIS)
    using Bottom-Up Dynamic Programming.

    Parameters
    ----------
    request : LISRequest

    Returns
    -------
    int
        Length of the longest increasing subsequence.
    """

    sequence = request.sequence
    n = len(sequence)

    # L[i] = length of the longest increasing subsequence
    # ending at position i.
    dp = [1] * n

    for j in range(1, n):

        for i in range(j):

            if (
                sequence[i] < sequence[j]
                and dp[i] + 1 > dp[j]
            ):
                dp[j] = dp[i] + 1

    return max(dp)