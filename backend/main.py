from fastapi import FastAPI

from routes.knapsack_routes import router as knapsack_router
from routes.bellman_ford_routes import router as bellman_router
from routes.weighted_interval_scheduling_routes import router as weighted_router
from routes.longest_increasing_subsequence_routes import router as lis_router
from routes.sequence_alignment_routes import router as alignment_router

app = FastAPI(
    title="Dynamic Programming Calculator",
    description="API containing classical Dynamic Programming algorithms.",
    version="1.0.0",
)

app.include_router(
    knapsack_router,
    prefix="/knapsack",
    tags=["Knapsack"]
)

app.include_router(
    bellman_router,
    prefix="/bellman-ford",
    tags=["Bellman-Ford"]
)

app.include_router(
    weighted_router,
    prefix="/weighted-interval",
    tags=["Weighted Interval Scheduling"]
)

app.include_router(
    lis_router,
    prefix="/longest-increasing-subsequence",
    tags=["Longest Increasing Subsequence"]
)

app.include_router(
    alignment_router,
    prefix="/sequence-alignment",
    tags=["Sequence Alignment"]
)


@app.get("/")
def root():
    return {
        "message": "Dynamic Programming Calculator API",
        "algorithms": [
            "Knapsack",
            "Bellman-Ford",
            "Weighted Interval Scheduling",
            "Longest Increasing Subsequence",
            "Sequence Alignment"
        ]
    }