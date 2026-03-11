# Type Safety Guidelines

> Type patterns, validation, and IDE support for JavaScript.

---

## Overview

This project is a **JavaScript-first** project, but it uses **`jsconfig.json`** and **`.d.ts`** files to provide better IDE support and basic type checking.

- **Language**: JavaScript (`.js`, `.vue`).
- **Type Checking**: VS Code / Volar use TypeScript-under-the-hood via `jsconfig.json`.

---

## Global Types

The project defines global types in `global.d.ts` to help the IDE understand the custom properties injected into the Vue instance.

- **`$api`**: Typed using `apiType` from `@/axios/api`.

---

## API Types

API types are auto-generated and stored in `src/axios/model.js`.

- Use these models for documenting your data structures.
- For complex logic, you can use JSDoc comments to help the IDE.

```javascript
/**
 * @typedef {import('@/axios/model').DatasetOut} DatasetOut
 */

/**
 * @param {DatasetOut} ds
 */
function processDataset(ds) {
  // IDE will now provide auto-complete for ds.id, ds.name, etc.
}
```

---

## Guidelines

- [OK] **Maintain `jsconfig.json`**: Ensure all path aliases and library types are registered.
- [OK] **Use JSDoc for complex logic**: Help yourself and others by documenting input/output types of complex functions.
- [OK] **Follow Pydantic models**: Ensure your frontend data structures match the backend's Pydantic schemas.
- [X] **Avoid `any` style code**: Even in JS, try to maintain a consistent data structure.
