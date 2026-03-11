# State Management Guidelines

> Local state, global state (Pinia), and server state.

---

## Global State: Pinia

This project uses **[Pinia](https://pinia.vuejs.org/)** for global state management.

### Store Pattern: Setup Store

Stores should be defined using the **Setup Store** (function) syntax.

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useGlobal } from '@/hooks/general/useGlobal'

export const useMyStore = defineStore('myStore', () => {
  // Use useGlobal hook to access $api
  const { $api } = useGlobal()
  
  // State
  const items = ref([])
  const loading = ref(false)

  // Getters
  const itemCount = computed(() => items.value.length)

  // Actions
  async function fetchItems() {
    loading.value = true
    try {
      const res = await $api.domain.list()
      items.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { items, loading, itemCount, fetchItems }
})
```

---

## Local State

For component-specific state, use `data()` in Options API components.

- **Sync with Props**: If a component needs to mutate a value passed via `v-model`, use a local `ref` or `data` property and `watch` the prop.

---

## Usage in Components

### Options API (Preferred)
Use `mapState` and `mapActions` from `pinia`.

```javascript
import { mapState, mapActions } from 'pinia'
import { useDataflow } from '@/stores/dataflow'

export default {
  computed: {
    ...mapState(useDataflow, ['datasets', 'currentPipeline'])
  },
  methods: {
    ...mapActions(useDataflow, ['getDatasets', 'getPipelines'])
  }
}
```

### Composition API
Call the store function directly.

```javascript
import { useDataflow } from '@/stores/dataflow'
const dataflowStore = useDataflow()
console.log(dataflowStore.datasets)
```

---

## Guidelines

- [OK] **Keep stores focused**: Create separate stores for different functional domains (e.g., `theme.js`, `dataflow.js`).
- [OK] **Handle loading states**: Always wrap async actions in `try/finally` to ensure loading indicators are reset.
- [OK] **Centralize API calls**: Prefer putting data-fetching logic in Pinia stores if the data is shared across multiple components.
- [X] **Don't over-use global state**: If a piece of state is only used by one component and its children, use local state or props.
