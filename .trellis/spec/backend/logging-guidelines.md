# Logging Guidelines

> Structured logging, log levels, and what to log.

---

## Logging Framework

This project uses **[Loguru](https://github.com/Delgan/loguru)** for all logging.

- **Import**: `from loguru import logger`
- **Configuration**: Managed in `app/core/logger_setup.py`.

---

## Log Levels

Follow these conventions for log levels:

| Level | When to use | Example |
|-------|-------------|---------|
| `DEBUG` | Detailed info, usually for troubleshooting | `logger.debug(f"Input payload: {payload}")` |
| `INFO` | High-level operations (server start, task creation) | `logger.info(f"Registered {cnt} datasets.")` |
| `SUCCESS` | Successful completion of major operations | `logger.success(f"Pipeline {id} finished.")` |
| `WARNING` | Something unusual but not a failure | `logger.warning(f"Skipping missing file: {path}")` |
| `ERROR` | Operation failed, but application continues | `logger.error(f"Failed to register dataset: {e}")` |
| `CRITICAL` | Major failure that might crash the app | `logger.critical("Database connection lost!")` |

---

## Logging Practices

### 1. F-Strings for Messages
Loguru handles f-strings naturally. Use them for clear, human-readable messages.

```python
logger.info(f"Scanning directory: {dataset_dir}")
```

### 2. Logging Exceptions
Use `logger.exception()` in `except` blocks to capture the full stack trace.

```python
try:
    ds = registry.add_or_update(payload)
except Exception as e:
    logger.exception(f"Failed to register dataset: {e}")
```

### 3. Context and Tags
While not heavily used yet, Loguru supports `bind` for adding context (like `task_id`).

---

## Guidelines

- [OK] **Don't use `print()`**. Use `logger.info()` or `logger.debug()` instead.
- [OK] **Log meaningful context**. Instead of `logger.error("Failed")`, use `logger.error(f"Failed to update dataset {id}: {e}")`.
- [OK] **Use `logger.exception`** only when you need the full stack trace.
- [X] **Avoid excessive logging** in hot paths (loops that run thousands of times) to prevent log bloat.
