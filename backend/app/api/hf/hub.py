import os
import shutil
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body, Path, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.core.container import container
from app.core.config import settings
from app.schemas.dataset import DatasetOut

router = APIRouter(tags=["hf-hub"])


def _proxy_get(path: str, params: dict = None):
    """Proxy a GET request to EXTERNAL_HF_API_URL. Raises HTTPException on failure."""
    if not settings.EXTERNAL_HF_API_URL:
        raise HTTPException(503, "Dataset registry is disabled and EXTERNAL_HF_API_URL is not configured")
    import httpx
    url = settings.EXTERNAL_HF_API_URL.rstrip("/") + "/" + path.lstrip("/")
    try:
        resp = httpx.get(url, params={k: v for k, v in (params or {}).items() if v is not None}, timeout=30)
        if resp.status_code == 404:
            raise HTTPException(404, resp.text)
        resp.raise_for_status()
        return resp.json()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"External HF API request failed: {e}")

class CreateRepoRequest(BaseModel):
    name: str
    type: str = "dataset"
    organization: Optional[str] = None
    private: Optional[bool] = False

class DeleteRepoRequest(BaseModel):
    name: str
    type: str = "dataset"
    organization: Optional[str] = None

@router.get("/api/datasets", summary="List all datasets")
def list_datasets(
    author: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    direction: Optional[int] = -1,
    limit: Optional[int] = Query(100, ge=1),
    full: Optional[bool] = False,
):
    if container.dataset_registry is None:
        return _proxy_get("/api/datasets", {"author": author, "search": search, "sort": sort,
                                            "direction": direction, "limit": limit, "full": full})
    datasets = container.dataset_registry.list()
    # Apply basic filtering if needed, though HF API handles it more complexly.
    # For now, return all formatted as needed by frontend
    result = []
    for ds in datasets:
        if search and search.lower() not in ds.get("name", "").lower():
            continue
        result.append({
            "id": ds.get("repo_id"),
            "author": ds.get("namespace"),
            "tags": [],
            "downloads": 0,
            "likes": 0,
            "private": False,
            "lastModified": ds.get("added_at"),
            "createdAt": ds.get("added_at"),
            # Ensure compatibility with frontend expecting these fields:
            "num_samples": ds.get("num_samples", 0),
            "file_size": ds.get("file_size", 0),
            "hash": ds.get("hash")
        })
    return result

@router.post("/api/repos/create", summary="Create a new dataset repository")
def create_repo(req: CreateRepoRequest):
    if container.dataset_registry is None:
        raise HTTPException(503, "Dataset registry is disabled; cannot create datasets when using external HF API")
    if req.type != "dataset":
        raise HTTPException(400, "Only dataset creation is supported")
    
    namespace = req.organization or "local"
    repo_id = f"{namespace}/{req.name}"
    
    # Check if exists
    if container.dataset_registry.get_by_repo_id(repo_id):
        raise HTTPException(409, f"Repository {repo_id} already exists")
    
    # For creating an empty repository, we might just store metadata without a valid file initially
    # Or create an empty directory.
    upload_dir = os.path.join(os.path.dirname(container.dataset_registry.path), "repos", namespace, req.name)
    os.makedirs(upload_dir, exist_ok=True)
    
    ds_dict = {
        "name": req.name,
        "namespace": namespace,
        "repo_id": repo_id,
        "root": upload_dir,  # This might need to be updated when a file is uploaded
        "pipeline": "custom",
        "meta": {},
        "type": "dir",
    }
    
    container.dataset_registry.add_or_update(ds_dict)
    
    return {"name": req.name, "owner": namespace}

@router.delete("/api/repos/delete", summary="Delete a dataset repository")
def delete_repo(req: DeleteRepoRequest):
    if container.dataset_registry is None:
        raise HTTPException(503, "Dataset registry is disabled; cannot delete datasets when using external HF API")
    if req.type != "dataset":
        raise HTTPException(400, "Only dataset deletion is supported")
    
    namespace = req.organization or "local"
    repo_id = f"{namespace}/{req.name}"
    
    ds = container.dataset_registry.get_by_repo_id(repo_id)
    if not ds:
        raise HTTPException(404, "Repository not found")
        
    container.dataset_registry.remove(ds["id"])
    return {"deleted": True}

@router.post("/api/datasets/{namespace}/{dataset_name}/upload/{revision}/{path:path}", summary="Upload a file to the dataset")
async def upload_file(
    namespace: str,
    dataset_name: str,
    revision: str,
    path: str,
    file: UploadFile = File(...),
):
    if container.dataset_registry is None:
        raise HTTPException(503, "Dataset registry is disabled; cannot upload files when using external HF API")
    repo_id = f"{namespace}/{dataset_name}"
    ds = container.dataset_registry.get_by_repo_id(repo_id)
    
    if not ds:
        # Create it dynamically if missing? Or require create_repo first.
        raise HTTPException(404, "Repository not found. Create it first.")
        
    # Assuming ds["root"] is a directory, if it's a file, we might have an issue
    base_dir = ds["root"]
    if os.path.isfile(base_dir):
        base_dir = os.path.dirname(base_dir)
        
    file_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update the dataset registry root if it was a directory and this is the main file
    # Or just keep it as directory. For now, assuming the dataset points to the main file or directory.
    # We update the root to the newly uploaded file for simplicity, 
    # to maintain backward compatibility with visualization needing a file path.
    ds["root"] = file_path
    container.dataset_registry.add_or_update(ds)
    
    return {"commit": {"oid": "new_hash"}, "url": f"/datasets/{repo_id}/resolve/{revision}/{path}"}

@router.get("/api/datasets/{namespace}/{dataset_name}", summary="Get dataset repository metadata")
def get_dataset_metadata(namespace: str, dataset_name: str):
    repo_id = f"{namespace}/{dataset_name}"
    if container.dataset_registry is None:
        return _proxy_get(f"/api/datasets/{repo_id}")
    ds = container.dataset_registry.get_by_repo_id(repo_id)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    return {
        "id": repo_id,
        "author": namespace,
        "lastModified": ds.get("added_at"),
        "tags": [],
        "private": False,
        "downloads": 0,
        "likes": 0,
        "description": "",
        "siblings": [
            {"rfilename": os.path.basename(ds.get("root", ""))},
        ],
        # Extraneous fields for compatibility
        "num_samples": ds.get("num_samples", 0),
        "file_size": ds.get("file_size", 0),
        "hash": ds.get("hash"),
        "features": ds.get("features", {}),
        "splits": ds.get("splits", {})
    }

@router.get("/datasets/{namespace}/{dataset_name}/resolve/{revision}/{path:path}", summary="Download or stream a file")
def resolve_file(namespace: str, dataset_name: str, revision: str, path: str):
    repo_id = f"{namespace}/{dataset_name}"
    if container.dataset_registry is None:
        if not settings.EXTERNAL_HF_API_URL:
            raise HTTPException(503, "Dataset registry is disabled and EXTERNAL_HF_API_URL is not configured")
        import httpx
        url = f"{settings.EXTERNAL_HF_API_URL.rstrip('/')}/datasets/{repo_id}/resolve/{revision}/{path}"
        try:
            resp = httpx.get(url, timeout=60, follow_redirects=True)
            if resp.status_code == 404:
                raise HTTPException(404, "File not found in external HF API")
            resp.raise_for_status()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(502, f"External HF API request failed: {e}")
        from fastapi.responses import Response
        return Response(content=resp.content, media_type=resp.headers.get("content-type", "application/octet-stream"))
    ds = container.dataset_registry.get_by_repo_id(repo_id)
    if not ds:
        raise HTTPException(404, "Dataset not found")
        
    root = ds.get("root", "")
    # Check if root is exactly the file requested or a directory
    if os.path.isfile(root) and os.path.basename(root) == path:
        target_file = root
    elif os.path.isdir(root):
        target_file = os.path.join(root, path)
    else:
        # Fallback 
        target_file = root
        
    if not os.path.exists(target_file) or not os.path.isfile(target_file):
        raise HTTPException(404, "File not found")
        
    return FileResponse(target_file, filename=os.path.basename(target_file))
