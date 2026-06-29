from schemas import WeightedIntervalRequest


def _compute_previous_jobs(intervals: list) -> list[int]:
    """
    Computes p(j), where p(j) is the index of the last interval
    compatible with interval j.

    Returns
    -------
    list[int]
        Previous compatible interval for each interval.
        -1 indicates that no compatible interval exists.
    """

    previous = []

    for current in range(len(intervals)):

        index = -1

        for candidate in range(current - 1, -1, -1):

            if intervals[candidate].finish <= intervals[current].start:
                index = candidate
                break

        previous.append(index)

    return previous


def weighted_interval_scheduling(
    request: WeightedIntervalRequest
) -> int:
    """
    Solves the Weighted Interval Scheduling problem using
    Bottom-Up Dynamic Programming.

    Returns
    -------
    int
        Maximum achievable weight.
    """

    intervals = sorted(
        request.intervals,
        key=lambda interval: interval.finish
    )

    previous = _compute_previous_jobs(intervals)

    n = len(intervals)

    dp = [0] * (n + 1)

    for j in range(1, n + 1):

        current = intervals[j - 1]

        include = current.weight

        if previous[j - 1] != -1:
            include += dp[previous[j - 1] + 1]

        exclude = dp[j - 1]

        dp[j] = max(include, exclude)

    return dp[n]