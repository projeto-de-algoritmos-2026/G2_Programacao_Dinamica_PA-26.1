from math import inf

from schemas import BellmanFordRequest
from utils import validate_edge, validate_vertex


def bellman_ford(request: BellmanFordRequest) -> tuple[list[float], bool]:
    """
    Solves the Single-Source Shortest Path problem using
    the Bellman-Ford algorithm.

    Parameters
    ----------
    request : BellmanFordRequest

    Returns
    -------
    tuple[list[float], bool]
        (distances, negative_cycle)
    """

    vertices = request.vertices
    source = request.source
    edges = request.edges

    validate_vertex(source, vertices)

    for edge in edges:
        validate_edge(
            edge.source,
            edge.destination,
            vertices
        )

    distances = [inf] * vertices
    distances[source] = 0

    # Relax all edges |V| - 1 times.
    for _ in range(vertices - 1):

        updated = False

        for edge in edges:

            if distances[edge.source] == inf:
                continue

            candidate = (
                distances[edge.source]
                + edge.weight
            )

            if candidate < distances[edge.destination]:

                distances[edge.destination] = candidate
                updated = True

        # Early stopping.
        if not updated:
            break

    # Check for negative-weight cycles.
    for edge in edges:

        if distances[edge.source] == inf:
            continue

        if (
            distances[edge.source]
            + edge.weight
            < distances[edge.destination]
        ):
            return distances, True

    return distances, False