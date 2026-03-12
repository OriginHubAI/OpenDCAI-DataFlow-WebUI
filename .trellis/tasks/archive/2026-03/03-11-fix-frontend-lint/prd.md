# Fix Frontend Lint Errors

## Goal
Fix all ESLint errors and warnings in the frontend codebase to ensure code quality and consistency.

## Requirements
- Run the frontend lint command: `npm run lint` inside the `frontend` directory.
- Address all reported linting errors across `.vue`, `.js`, `.cjs`, and `.mjs` files.
- Ensure that `npm run lint` completes without errors.

## Acceptance Criteria
- [ ] Running `npm run lint` returns an exit code of 0.
- [ ] No regressions or functionality breakage are introduced by the lint fixes.

## Technical Notes
- Follow existing `.eslintrc.cjs` rules.
- Only fix style and formatting issues if they are explicitly caught by ESLint. Let `prettier` handle standard formatting.