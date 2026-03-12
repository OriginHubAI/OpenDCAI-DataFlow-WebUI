# Datasets V2 API Specification (HF Compatible)

> **Purpose**: Upgrade the Dataset API to a pure Hugging Face Datasets compatible protocol, entirely replacing the legacy API while fully supporting all DataFlow WebUI frontend requirements.

---

## 1. Design Overview

The V2 API adopts a **Repository-based** structure, strictly adhering to the Hugging Face Hub and Dataset Viewer API protocols. This enables the DataFlow backend to act as a native source for `datasets.load_dataset()` and provides the frontend with a standardized way to manage and visualize data.

### Core Concepts
- **Repo ID**: Formatted as `namespace/dataset_name` (e.g., `local/my-data`).
- **Revision**: A Git-like commit hash (defaults to file hash or `main`).
- **Split/Config**: Supports HF-standard `train`, `test` splits and `default` configurations.

---

## 2. API Endpoints

All endpoints are prefixed with `/api/hf` to namespace the Hugging Face compatibility layer.

### 2.1 Hub Management API (Frontend Admin Needs)
These endpoints replace the legacy v1 API, providing pure HF-compatible routes for the frontend to list, create, and manage datasets.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hf/api/datasets` | List all datasets. Supports search/filtering by author, tags, etc. |
| POST | `/api/hf/api/repos/create` | Create a new dataset repository (requires JSON body with `type="dataset"`). |
| DELETE | `/api/hf/api/repos/delete` | Delete a dataset repository. |
| POST | `/api/hf/api/datasets/{repo_id}/upload/{revision}/{path}` | Upload a file to the dataset. |

### 2.2 Dataset Resolution API
These endpoints handle direct file access and core Hub metadata.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hf/api/datasets/{repo_id}` | Get dataset repository metadata (author, tags, last modified). |
| GET | `/api/hf/datasets/{repo_id}/resolve/{revision}/{path}` | Download or stream a specific file within the dataset. |

### 2.3 Dataset Viewer API (Frontend Data Browsing & Preview)
These endpoints replicate the core functionalities of the Hugging Face Dataset Viewer, enabling the frontend to implement data preview, pagination, filtering, and statistical analysis natively.

**Base URL Prefix**: `/api/hf/viewer` (all endpoints require `dataset={repo_id}` as a query parameter).

#### 2.3.1 Essential Metadata & Data Browsing (Required)
These are the core endpoints required for basic dataset preview and pagination in the frontend.

| Method | Endpoint | Required Params | Optional Params | Description |
|--------|----------|-----------------|-----------------|-------------|
| GET | `/is-valid` | `dataset` | `config`, `split` | Check supported capabilities (preview, viewer). |
| GET | `/splits` | `dataset` | `config` | Get the list of dataset configs and splits (e.g., train, validation, test). |
| GET | `/info` | `dataset` | `config` | Get dataset feature structure, types, and metadata. |
| GET | `/first-rows` | `dataset`, `config`, `split` | | Preview the first 100 rows. Fast response. |
| GET | `/rows` | `dataset`, `config`, `split` | `offset` (default: 0), `length` (max: 100) | Paginated access to arbitrary data slices. |

#### 2.3.2 Advanced Features (Optional)
These endpoints provide advanced functionalities that are not strictly necessary for basic data browsing, but can be implemented to enhance the frontend experience (e.g., search, filtering, and statistical visualizations).

| Method | Endpoint | Required Params | Optional Params | Description |
|--------|----------|-----------------|-----------------|-------------|
| GET | `/statistics` | `dataset`, `config`, `split` | | Get descriptive statistics (min, max, mean, histogram) for columns. |
| GET | `/search` | `dataset`, `config`, `split`, `query` | `offset`, `length` | Full-text search across text columns. |
| GET | `/filter` | `dataset`, `config`, `split`, `where` | `offset`, `length` | SQL-like filtering (e.g., `Age = 30 AND Fare > 50`). |

#### 2.3.3 Standard Response Format (Data Rows)
The endpoints `/first-rows`, `/rows`, `/search`, and `/filter` return data in a standard format:

```json
{
  "features": [
    {"feature_idx": 0, "name": "text", "type": {"dtype": "string", "_type": "Value"}},
    {"feature_idx": 1, "name": "label", "type": {"names": ["neg", "pos"], "_type": "ClassLabel"}}
  ],
  "rows": [
    {
      "row_idx": 0,
      "row": {"text": "Sample text data", "label": 1},
      "truncated_cells": []
    }
  ],
  "num_rows_total": 25000,
  "num_rows_per_page": 100,
  "partial": false
}
```
*Frontend note: The `features` array defines the column schema, which is essential for rendering the correct cell component (e.g., Text, Image, Audio, ClassLabel).*

---

## 3. Data Model Changes

### V2 Dataset Record
The dataset record will internally map to the HF Hub specifications:
```yaml
id: "abc12345"
repo_id: "local/my-data"
name: "my-data"
namespace: "local"
root: "/absolute/path/to/dataset_repo/"
features:
  text: {"dtype": "string", "_type": "Value"}
  label: {"_type": "ClassLabel", "names": ["neg", "pos"]}
splits:
  train: {"num_examples": 100, "file_path": "data/train-00000-of-00001.parquet"}
```

---

## 4. Difference Analysis (Legacy vs V2)

| Feature | Legacy API | V2 HF Compatible API |
|---------|------------|----------------------|
| **Identification** | `ds_id` (Flat hash) | `repo_id` (Namespace/Name) |
| **Data Format** | Any (CSV, JSON, etc.) | Optimized Parquet + Original |
| **Metadata** | Basic (size, samples) | HF `DatasetInfo` (Features, Configs) |
| **Access Pattern** | Local filesystem access | HTTP Resolve / Streaming via Viewer API |
| **Versioning** | None | `revision` (Hash-based) |
| **Scalability** | Small files only | Iterable support via Parquet shards / Pagination |

---

## 5. Implementation Strategy

1.  **Pure HF Architecture**: Eliminate the legacy `/api/v1/datasets/` endpoints. The frontend will be refactored to consume `/api/hf/api/datasets` for management and `/api/hf/viewer` for browsing.
2.  **On-the-fly Parquet Export**: When a dataset is requested via the Viewer API, the backend will check for cached `.parquet` versions. If missing, it uses `VisualizeDatasetService` to generate them.
3.  **Virtual Hub**: By setting `HF_ENDPOINT` to the DataFlow server, users can seamlessly use standard HF libraries:
    ```python
    load_dataset("local/my-data", endpoint="http://localhost:8000/api/hf")
    ```