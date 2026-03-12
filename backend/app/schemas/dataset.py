from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.pipelines import Pipeline

class DatasetIn(BaseModel):
    name: str
    root: str
    pipeline: str = Field(
        ...,
        description="指定一个或多个该数据集适合的 pipeline"
    )
    meta: Dict[str, Any] = Field(default_factory=dict)
    namespace: Optional[str] = "local"
    repo_id: Optional[str] = None

class DatasetOut(DatasetIn):
    id: str
    num_samples: int = 0
    file_size: int = 0
    hash: Optional[str] = None
    repo_id: str
    features: Optional[Dict[str, Any]] = Field(default_factory=dict)
    splits: Optional[Dict[str, Any]] = Field(default_factory=dict)
