from schemas import KnapsackRequest
from utils import initialize_matrix


def knapsack(request: KnapsackRequest) -> int:
    """
    Solves the 0/1 Knapsack Problem using Dynamic Programming.

    Parameters
    ----------
    request : KnapsackRequest
        Knapsack instance containing capacity and items.

    Returns
    -------
    int
        Maximum obtainable value.
    """

    capacity = request.capacity
    items = request.items

    n = len(items)

    # DP table:
    # rows -> items considered
    # cols -> current capacity
    dp = initialize_matrix(n + 1, capacity + 1)

    for i in range(1, n + 1):

        weight = items[i - 1].weight
        value = items[i - 1].value

        for current_capacity in range(capacity + 1):

            # Item does not fit.
            if weight > current_capacity:

                dp[i][current_capacity] = dp[i - 1][current_capacity]

            # Choose the best between taking or leaving the item.
            else:

                without_item = dp[i - 1][current_capacity]

                with_item = (
                    value
                    + dp[i - 1][current_capacity - weight]
                )

                dp[i][current_capacity] = max(
                    without_item,
                    with_item
                )

    return dp[n][capacity]