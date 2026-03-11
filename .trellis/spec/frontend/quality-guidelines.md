# Frontend Quality Guidelines

> Code standards, forbidden patterns, and linting.

---

## Code Standards

- **Language**: All code and comments MUST be in English.
- **Framework**: Use Vue 3 (Options API is currently the project-wide standard for views and generic components).
- **API Access**: Always use the generated `$api` client for backend interaction.

---

## Tooling

### 1. Linting (ESLint)
Check and fix lint errors using:
```bash
npm run lint
```
The project uses `eslint-plugin-vue` and `@vue/eslint-config-prettier`.

### 2. Formatting (Prettier)
Format the codebase using:
```bash
npm run format
```

### 3. API Sync (api-cli)
Regenerate API request code after backend changes:
```bash
npm run api
```

---

## Forbidden Patterns

- [X] **Direct Axios usage**: Don't import `axios` directly in components for backend API calls; use `this.$api`.
- [X] **Hardcoded Base URL**: Backend URLs are managed in `vite.config.js` and `.env` files.
- [X] **Manual GUID**: Use the global `$Guid()` method instead of custom random ID logic.
- [X] **Mixing Languages**: Ensure all user-facing text is translated (the project uses a custom translator helper/pattern).

---

## Styling Guidelines

- **Namespacing**: Ensure all component styles are scoped or use a unique root class.
- **Responsive**: Design for desktop first as this is a complex management interface.
- **Feedback**: Use `$barWarning` or `$infoBox` for all important user feedback.
