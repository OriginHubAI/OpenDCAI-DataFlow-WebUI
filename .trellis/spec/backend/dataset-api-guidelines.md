# Dataset API Guidelines

> **Purpose**: Define the standards and implementation details for Dataset-related operations across backend and frontend.

---

## 1. Overview

Datasets in this project are managed via a registry pattern. They represent file-based data sources (CSV, JSON, Parquet, etc.) that can be used as inputs for Pipelines.

- **Registry Storage**: `backend/data/data_registry.yaml` (configured by `DATA_REGISTRY` env).
- **ID Generation**: `ds_id` is the first 10 characters of the MD5 hash of the dataset's absolute `root` path.
- **Scanning**: At startup, the backend scans `settings.DATAFLOW_CORE_DIR/example_data` to auto-register datasets.

---

## 2. Backend API Reference

### Base Path: `/api/v1/datasets`

| Method | Endpoint | Summary | Response Model |
|--------|----------|---------|----------------|
| GET | `/` | List all registered datasets | `ApiResponse[list[DatasetOut]]` |
| POST | `/` | Register or update a dataset | `ApiResponse[DatasetOut]` |
| GET | `/list_dir` | List files in a local directory | `ApiResponse[list[dict]]` |
| GET | `/{ds_id}` | Get dataset details by ID | `ApiResponse[DatasetOut]` |
| DELETE | `/{ds_id}` | Delete dataset from registry | `ApiResponse[dict]` |
| GET | `/pandas_type_sample/{ds_id}` | Get Pandas-compatible JSON sample | `ApiResponse[str]` (JSON string) |
| GET | `/file_type_sample/{ds_id}` | Get raw file (images, PDFs, etc.) | `FileResponse` |
| GET | `/preview/{ds_id}` | Get JSON preview of records | `ApiResponse[list[dict]]` |
| GET | `/columns/{ds_id}` | Get list of column names | `ApiResponse[list[str]]` |
| POST | `/upload` | Upload a file and register as dataset | `ApiResponse[DatasetOut]` |

### Data Models (Schemas)

#### `DatasetIn`
```python
class DatasetIn(BaseModel):
    name: str
    root: str  # Absolute path to the data file
    pipeline: str  # Suitable pipeline(s)
    meta: Dict[str, str] = {}
```

#### `DatasetOut` (Extends `DatasetIn`)
```python
class DatasetOut(DatasetIn):
    id: str  # First 10 chars of MD5(root)
    num_samples: int  # Row count or entry count
    file_size: int  # Size in bytes
    hash: Optional[str]  # MD5 hash of file content
    type: str  # File extension (e.g., "csv", "jsonl")
    added_at: str  # ISO timestamp
```

---

## 3. Visualization & Preview Logic

The `VisualizeDatasetService` handles data extraction for the UI.

### Supported File Types for Pandas Preview
Used by `get_pandas_data` (returns records as JSON string):
- `csv`, `excel`, `json`, `parquet`, `pickle`, `jsonl`

### Supported Media Types for Raw Preview
Used by `get_file_type_data` (returns `FileResponse`):
- **Text**: `txt`, `md`
- **Images**: `jpg`, `jpeg`, `png`, `gif`
- **Documents**: `pdf`, `doc`, `docx`, `ppt`, `pptx`

### Records Preview & Column Extraction
Used by `get_dataset_preview` and `get_dataset_columns`:
- **Supported**: `json`, `jsonl`, `parquet`
- **Logic**:
    - `jsonl`: Reads line by line.
    - `json`: Loads full file (assumes list of dicts).
    - `parquet`: Uses `pandas.read_parquet(nrows=...)`.

---

## 4. Frontend Integration

Frontend interacts with these APIs via `frontend/src/axios/api.js`.

### API Client
```javascript
import { datasets } from '@/axios/api'

// Example: List all datasets
const data = await datasets.list_datasets()
```

### Type Support
Models are defined in `frontend/src/axios/model.js` as classes matching the backend schemas. Use JSDoc for IDE support:
```javascript
/** @type {UserModel.DatasetOut[]} */
const datasetList = []
```

---

## 5. Development Patterns

1. **Path Stability**: Dataset IDs are tied to their paths. Moving a file requires re-registering it (which generates a new ID).
2. **Lazy Calculation**: `num_samples` and `file_size` are calculated at registration time to avoid overhead during listing.
3. **Registry Pattern**: Always use `container.dataset_registry` in the backend to interact with datasets to ensure the YAML file stays in sync.
