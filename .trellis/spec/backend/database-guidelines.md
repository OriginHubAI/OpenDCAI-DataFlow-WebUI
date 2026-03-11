# Database and Persistence Guidelines

> Naming conventions, persistence patterns, and ORM (YAML-based) usage.

---

## Overview

This project uses a **YAML-based Registry** for persistence instead of a traditional relational database like PostgreSQL.

- **Storage**: Data is stored as structured YAML files (e.g., `data/datasets.yaml`).
- **Access**: Managed via `Registry` classes in `app/services/`.

---

## The Registry Pattern

Every main entity has a corresponding `Registry` class that follows these patterns:

### 1. File management (`_ensure`, `_read`, `_write`)

Registries are responsible for ensuring their YAML files exist and managing file I/O.

```python
# Example from DatasetRegistry
def _ensure(self):
    if not os.path.exists(self.path):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            yaml.safe_dump({"datasets": {}}, f)

def _read(self) -> Dict:
    with open(self.path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {"datasets": {}}

def _write(self, data: Dict):
    with open(self.path, "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)
```

### 2. CRUD Operations

Registries implement methods like `add_or_update`, `get`, `list`, and `remove`.

- Use **unique identifiers** (e.g., `id`, `name`, or `path`) as keys in the YAML structure.
- Always perform a full read/write for any update (since it's YAML).

```python
def get(self, ds_id: str) -> Dict | None:
    data = self._read()
    return data["datasets"].get(ds_id)

def list(self) -> List[Dict]:
    data = self._read()
    return list(data["datasets"].values())
```

### 3. Dependency Injection via Container

Avoid instantiating registries directly in route handlers. Use the `container` singleton.

```python
# Correct
from app.core.container import container
ds = container.dataset_registry.get(ds_id)
```

---

## Guidelines

- [OK] **Atomic Writes**: Always overwrite the entire YAML file to ensure consistency (but be aware of concurrency).
- [OK] **Validation**: Always use Pydantic models in the API layer before passing data to registries.
- [X] **Avoid Large Files**: This pattern is not suitable for huge datasets. For large data, store metadata in YAML and the actual content in external files (e.g., `.parquet`, `.jsonl`).
- [X] **No Concurrent Writes**: The current implementation does not handle concurrent file access locks. Minimize write frequency.

---

## Examples

**Example: Adding/Updating a record**
```python
def add_or_update(self, item: dict) -> dict:
    # Use path-based hashing or similar for ID generation
    item_id = hashlib.md5(item["path"].encode()).hexdigest()
    item["id"] = item_id
    
    data = self._read()
    data["items"][item_id] = item
    self._write(data)
    return item
```
