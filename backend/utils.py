from __future__ import annotations


def validate_vertex(vertex: int, vertices: int):
    if vertex < 0 or vertex >= vertices:
        raise ValueError( f"Vertex {vertex} does not exist.")


def validate_edge(source: int, destination: int, vertices: int):
    validate_vertex(source, vertices)
    validate_vertex(destination, vertices)


def initialize_matrix(rows: int, columns: int, value: int = 0):
    return [
        [value for _ in range(columns)]
        for _ in range(rows)
    ]