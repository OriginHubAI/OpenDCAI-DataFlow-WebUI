# Frontend Directory Structure

> Module organization and file layout for the Vue 3 + Vite frontend.

---

## Source Directory: `frontend/src/`

All frontend logic resides in the `src/` directory.

| Directory | Purpose | Key Files / Patterns |
|-----------|---------|---------------------|
| `assets/` | Static assets (images, svg, fonts) | `logo/`, `ui/`, `nav/` |
| `axios/`  | API request setup and clients | `api.js`, `model.js`, `index.js` |
| `components/` | Reusable UI components | `general/`, `home/`, `manage/` |
| `hooks/`  | Composition API custom hooks | `dataflow/`, `general/` |
| `router/` | Route definitions | `index.js`, `Manage/` |
| `stores/` | Pinia state management | `dataflow.js`, `theme.js` |
| `style/`  | Global SCSS styles | `global.scss`, `dataflow.scss` |
| `views/`  | Page-level components | `manage/`, `client/` |

---

## Detailed breakdown

### 1. Components Layer (`components/`)
Organized by functional domains.
- **`general/`**: Common UI elements (buttons, panels, loaders).
- **`manage/mainFlow/`**: Complex components for the interactive dataflow editor.
- **Convention**: Use PascalCase for folder names and camelCase or PascalCase for `.vue` files.

### 2. Hooks Layer (`hooks/`)
Encapsulates complex logic using Vue 3 Composition API.
- **Naming Convention**: Always start with `use` (e.g., `usePipelineOperation.js`).

### 3. Views Layer (`views/`)
Components that correspond to a specific route.
- **`manage/`**: Backend management interface.
- **`client/`**: User-facing homepage/client interface.

### 4. Stores Layer (`stores/`)
Using Pinia for global state.
- **Pattern**: Each file usually defines one store (e.g., `useDataflow`).

### 5. Axios Layer (`axios/`)
Auto-generated API client code based on the backend `openapi.json`.
- **Usage**: Accessed via `this.$api` in Options API or via the injected plugin.

---

## Example: Adding a New Page

To add a new "Monitoring" page:
1. Create `views/manage/monitoring/index.vue`.
2. Add the route to `router/Manage/index.js`.
3. (Optional) Create `stores/monitoring.js` if global state is needed.
4. (Optional) Create any reusable components in `components/manage/monitoring/`.
