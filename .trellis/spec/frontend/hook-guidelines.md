# Hook Guidelines

> Custom hooks naming, patterns, and data fetching.

---

## Hook Pattern: Vue 3 Composition API

This project uses **custom hooks** (composables) to encapsulate complex logic.

### Basic Structure

```javascript
import { ref, onMounted } from 'vue'
import { useGlobal } from '@/hooks/general/useGlobal'

export function useMyHook() {
  const { $api } = useGlobal()
  const data = ref(null)

  const fetchData = async () => {
    const res = await $api.someDomain.list_items()
    data.value = res.data
  }

  onMounted(fetchData)

  return { data, fetchData }
}
```

---

## Core Hooks

### 1. `useGlobal` (`@/hooks/general/useGlobal`)
The essential hook to access global properties (which are injected into the Vue instance) inside the `setup()` function.

**Available properties via `useGlobal()`:**
- `$api`: The auto-generated API client.
- `$axios`: The raw axios instance.
- `$router`: Vue Router.
- `$barWarning`: Global alert/notification.
- `$infoBox`: Global confirmation box.
- `$Guid`: Guid generator.

### 2. `usePipelineOperation` (`@/hooks/dataflow/usePipelineOperation`)
Handles complex logic for rendering and manipulating the Vue Flow diagram.

---

## Guidelines for Hooks

- [OK] **Naming Convention**: Always start with `use` (e.g., `useEdgeSync.js`).
- [OK] **Use `useGlobal()`**: Instead of passing `this` or a `proxy` object as an argument, use `useGlobal()` to get access to common utilities.
- [OK] **Separate Domain Logic**: Keep related operations in separate folders within `src/hooks/` (e.g., `dataflow/`).
- [OK] **Return an Object**: Always return an object with the reactive refs and methods you want to expose.

---

## Example: Data Fetching Hook

```javascript
import { ref } from 'vue'
import { useGlobal } from '@/hooks/general/useGlobal'

export function useDatasets() {
  const { $api } = useGlobal()
  const datasets = ref([])
  const loading = ref(false)

  const getDatasetsList = async () => {
    loading.value = true
    try {
      const res = await $api.datasets.list_datasets()
      datasets.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { datasets, loading, getDatasetsList }
}
```
