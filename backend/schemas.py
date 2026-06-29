from pydantic import BaseModel, Field, PositiveInt, model_validator

#
# ===========================
# Knapsack
# ===========================
#

class KnapsackItem(BaseModel):
    weight: PositiveInt
    value: PositiveInt


class KnapsackRequest(BaseModel):
    capacity: PositiveInt
    items: list[KnapsackItem]


class KnapsackResponse(BaseModel):
    method: str = "Knapsack"
    maximum_value: int


#
# ===========================
# Bellman-Ford
# ===========================
#

class Edge(BaseModel):
    source: int
    destination: int
    weight: int


class BellmanFordRequest(BaseModel):
    vertices: PositiveInt
    source: int
    edges: list[Edge]


class BellmanFordResponse(BaseModel):
    method: str = "Bellman-Ford"
    distances: list[float]
    negative_cycle: bool


#
# ===========================
# Weighted Interval Scheduling
# ===========================
#

class Interval(BaseModel):
    start: int
    finish: int
    weight: int

    @model_validator(mode="after")
    def validate_interval(self):
        if self.finish <= self.start:
            raise ValueError(
                "finish must be greater than start."
            )
        return self


class WeightedIntervalRequest(BaseModel):
    intervals: list[Interval]


class WeightedIntervalResponse(BaseModel):
    method: str = "Weighted Interval Scheduling"
    maximum_weight: int


#
# ===========================
# Longest Increasing Subsequence
# ===========================
#

class LISRequest(BaseModel):
    sequence: list[int]

    @model_validator(mode="after")
    def validate_sequence(self):
        if len(self.sequence) == 0:
            raise ValueError(
                "Sequence cannot be empty."
            )
        return self


class LISResponse(BaseModel):
    method: str = "Longest Increasing Subsequence"
    length: int


#
# ===========================
# Sequence Alignment
# ===========================
#

class SequenceAlignmentRequest(BaseModel):
    sequence1: str
    sequence2: str

    match_score: int = Field(default=1)
    mismatch_penalty: int = Field(default=-1)
    gap_penalty: int = Field(default=-2)

    @model_validator(mode="after")
    def validate_sequences(self):

        if len(self.sequence1) == 0:
            raise ValueError(
                "sequence1 cannot be empty."
            )

        if len(self.sequence2) == 0:
            raise ValueError(
                "sequence2 cannot be empty."
            )

        return self


class SequenceAlignmentResponse(BaseModel):
    method: str = "Sequence Alignment"
    alignment_score: int