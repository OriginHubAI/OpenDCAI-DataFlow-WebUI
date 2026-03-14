from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from app.core.container import container
from app.core.config import settings

router = APIRouter(tags=["hf-viewer"])


def _proxy_viewer(endpoint: str, params: dict):
    """Proxy a viewer request to EXTERNAL_HF_API_URL. Raises HTTPException on failure."""
    if not settings.EXTERNAL_HF_API_URL:
        raise HTTPException(503, "Dataset registry is disabled and EXTERNAL_HF_API_URL is not configured")
    import httpx
    url = settings.EXTERNAL_HF_API_URL.rstrip("/") + "/" + endpoint.lstrip("/")
    try:
        resp = httpx.get(url, params={k: v for k, v in params.items() if v is not None}, timeout=30)
        if resp.status_code == 404:
            raise HTTPException(404, resp.text)
        resp.raise_for_status()
        return resp.json()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"External HF API request failed: {e}")


@router.get("/is-valid", summary="Check supported capabilities")
def is_valid(
    dataset: str,
    config: Optional[str] = "default",
    split: Optional[str] = None
):
    if container.dataset_registry is None:
        return _proxy_viewer("/is-valid", {"dataset": dataset, "config": config, "split": split})
    ds = container.dataset_registry.get_by_repo_id(dataset)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    return {
        "preview": True,
        "viewer": True,
        "search": False,      # Advanced feature skipped
        "filter": False,      # Advanced feature skipped
        "statistics": False   # Advanced feature skipped
    }

@router.get("/splits", summary="Get the list of dataset configs and splits")
def get_splits(
    dataset: str,
    config: Optional[str] = None
):
    if container.dataset_registry is None:
        return _proxy_viewer("/splits", {"dataset": dataset, "config": config})
    ds = container.dataset_registry.get_by_repo_id(dataset)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    splits_data = ds.get("splits", {"default": {"num_examples": ds.get("num_samples", 0)}})
    
    splits_list = []
    # Simplified handling: assuming one config "default" and whatever splits are defined
    # The actual HF format returns a flat list
    for split_name in splits_data:
        splits_list.append({
            "dataset": dataset,
            "config": config or "default",
            "split": split_name
        })
        
    return {
        "splits": splits_list,
        "pending": [],
        "failed": []
    }

@router.get("/info", summary="Get dataset feature structure, types, and metadata")
def get_info(
    dataset: str,
    config: Optional[str] = "default"
):
    if container.dataset_registry is None:
        return _proxy_viewer("/info", {"dataset": dataset, "config": config})
    ds = container.dataset_registry.get_by_repo_id(dataset)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    features = ds.get("features", {})
    if not features:
        # Dynamic feature detection if not specified
        # Try to infer from a few rows
        try:
            preview_data = container.dataset_registry.preview(ds["id"], num_lines=1)
            if preview_data and isinstance(preview_data, list) and len(preview_data) > 0:
                first_row = preview_data[0]
                for idx, (k, v) in enumerate(first_row.items()):
                    dtype = "string"
                    if isinstance(v, int): dtype = "int64"
                    elif isinstance(v, float): dtype = "float64"
                    elif isinstance(v, bool): dtype = "bool"
                    
                    features[k] = {"dtype": dtype, "_type": "Value"}
        except Exception:
            pass

    return {
        "dataset_info": {
            "description": "",
            "features": features,
            "builder_name": "parquet",
            "config_name": config,
            "version": {"version_str": "0.0.0"},
            "splits": ds.get("splits", {"default": {"num_examples": ds.get("num_samples", 0)}})
        }
    }

def format_features(features_dict: Dict) -> List[Dict]:
    features_list = []
    idx = 0
    for k, v in features_dict.items():
        features_list.append({
            "feature_idx": idx,
            "name": k,
            "type": v
        })
        idx += 1
    return features_list

@router.get("/first-rows", summary="Preview the first 100 rows")
def get_first_rows(
    dataset: str,
    config: Optional[str] = "default",
    split: Optional[str] = "default"
):
    if container.dataset_registry is None:
        return _proxy_viewer("/first-rows", {"dataset": dataset, "config": config, "split": split})
    ds = container.dataset_registry.get_by_repo_id(dataset)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    try:
        preview_data = container.dataset_registry.preview(ds["id"], num_lines=100)
    except Exception as e:
        raise HTTPException(500, f"Failed to get preview: {str(e)}")
        
    features = ds.get("features", {})
    
    # Infer features if empty
    if not features and preview_data:
        first_row = preview_data[0]
        for k, v in first_row.items():
            dtype = "string"
            if isinstance(v, int): dtype = "int64"
            elif isinstance(v, float): dtype = "float64"
            elif isinstance(v, bool): dtype = "bool"
            features[k] = {"dtype": dtype, "_type": "Value"}
            
    rows = []
    for idx, row in enumerate(preview_data):
        rows.append({
            "row_idx": idx,
            "row": row,
            "truncated_cells": []
        })

    return {
        "dataset": dataset,
        "config": config,
        "split": split,
        "features": format_features(features),
        "rows": rows,
        "truncated": False
    }

@router.get("/rows", summary="Paginated access to arbitrary data slices")
def get_rows(
    dataset: str,
    config: Optional[str] = "default",
    split: Optional[str] = "default",
    offset: int = Query(0, ge=0),
    length: int = Query(100, ge=1, le=100)
):
    if container.dataset_registry is None:
        return _proxy_viewer("/rows", {"dataset": dataset, "config": config, "split": split,
                                       "offset": offset, "length": length})
    ds = container.dataset_registry.get_by_repo_id(dataset)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    # We need a way to slice the data. `DatasetRegistry.preview` just reads from start.
    # To support actual offset/length, we might need more logic or just use pandas here.
    # For now, if the offset is small or we read full file:
    # Actually, pandas can skip rows.
    file_path = ds.get("root", "")
    file_type = ds.get("type", "").lower()
    
    try:
        chunk_data = []
        if file_type == "jsonl":
            import json
            with open(file_path, "r", encoding="utf-8") as f:
                for i, line in enumerate(f):
                    if i >= offset + length:
                        break
                    if i >= offset:
                        chunk_data.append(json.loads(line.strip()))
        elif file_type == "json":
            import json
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    chunk_data = data[offset:offset+length]
                else:
                    chunk_data = [data] if offset == 0 else []
        elif file_type == "parquet":
            import pandas as pd
            # To read specific rows efficiently or just read and slice
            # skip_rows isn't standard in read_parquet directly without pyarrow, but we can do:
            df = pd.read_parquet(file_path)
            chunk_data = df.iloc[offset:offset+length].to_dict(orient="records")
        elif file_type == "csv":
            import pandas as pd
            df = pd.read_csv(file_path, skiprows=range(1, offset+1), nrows=length)
            chunk_data = df.to_dict(orient="records")
        else:
            chunk_data = container.dataset_registry.preview(ds["id"], num_lines=offset+length)
            chunk_data = chunk_data[offset:offset+length]
    except Exception as e:
        raise HTTPException(500, f"Failed to get rows: {str(e)}")
        
    features = ds.get("features", {})
    if not features and chunk_data:
        first_row = chunk_data[0]
        for k, v in first_row.items():
            dtype = "string"
            if isinstance(v, int): dtype = "int64"
            elif isinstance(v, float): dtype = "float64"
            elif isinstance(v, bool): dtype = "bool"
            features[k] = {"dtype": dtype, "_type": "Value"}
            
    rows = []
    for idx, row in enumerate(chunk_data):
        rows.append({
            "row_idx": offset + idx,
            "row": row,
            "truncated_cells": []
        })
        
    data = {
        "features": format_features(features),
        "rows": rows,
        "num_rows_total": ds.get("num_samples", 0),
        "num_rows_per_page": length,
        "partial": False
    }
    return data

