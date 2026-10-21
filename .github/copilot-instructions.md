# MyDailyTasks App instructions

## Project overview
- This is a Vite + React + TypeScript daily task manager.
- The app stores tasks in browser localStorage under the `daily-task-app-v1` key.
- Keep behavior simple, polished, and production-safe.

## Coding standards
- Prefer TypeScript types over `any`.
- Keep React component logic readable and local to the file when possible.
- Preserve existing app UX and labels unless a feature change explicitly requires otherwise.
- Use existing CSS classes and structure in `src/App.css` rather than introducing new styling frameworks.
- When updating task data, keep the existing task shape: `id`, `title`, `notes`, `category`, `priority`, `completed`, `createdAt`.

## Validation
- Run `npm run build` after significant changes to verify TypeScript and Vite build success.
- Do not introduce unnecessary dependencies.
- Prefer minimal, targeted edits over broad refactors.

## Repo conventions
- Keep source files under `src/`.
- Use `.tsx` for React components and `.ts` for utility logic when new files are added.
- Preserve accessibility patterns already used in the app (labels, `aria-label`, buttons, etc.).
- Avoid breaking the current task filters: `all`, `active`, and `completed`.
