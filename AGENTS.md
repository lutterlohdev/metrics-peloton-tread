# AI Agent Guidelines & Architecture

When contributing to the **Peloton Tread Metrics Dashboard**, adhere strictly to the following architectural guidelines, workflow policies, and coding standards. This project is specifically tailored for analyzing Peloton Tread workouts.

---

## 1. Branching & Git Policy

> [!IMPORTANT]
> **Direct commits or merges to `master` are strictly prohibited.**
> Whenever making modifications, if you are currently on the `master` branch:
>
> 1. Check out the latest `master` and pull upstream changes.
> 2. Create and switch to a new dedicated feature or fix branch (e.g. `feature/new-chart`, `fix/parsing-bug`) before making any file modifications.
> 3. Perform work and commit only on the newly created branch.

---

## 2. Core Philosophy & Architecture

1. **Privacy First & Local-Only:**
   - All data processing must happen client-side in the browser.
   - Do **NOT** add any server-side routes, API endpoints for user data, or database interactions.
   - The user's workout CSV data is their own, and it must never leave their browser or be transmitted over the network.
2. **Framework & Reactivity:**
   - We use **Svelte 5** exclusively via **SvelteKit**.
   - Your code must utilize the new **Svelte 5 Runes** system (`$state`, `$derived`, `$effect`, `$props`). Do not use legacy Svelte 4 reactivity patterns (e.g., `export let`, `$:`, `<script context="module">`).
3. **Build Tool & Performance:**
   - Powered by **Vite**. Keep dependencies modern and fast.

---

## 3. Data Processing Flow

1. **Ingestion**: Data is uploaded via `src/lib/components/CsvImporter.svelte` and parsed client-side using `papaparse`.
2. **Normalization**: Extracted data passes through normalization and filtering in `src/lib/utils.js`. Ensure you filter out blank or malformed rows, and defensively check numeric fields and timestamps.
3. **State Management**: The processed dataset is stored and reactively derived using Svelte 5 state in `src/lib/store.js`.

---

## 4. Charting & Visualization Guidelines

- **Library**: `chart.js` directly with `chartjs-adapter-date-fns` for time scaling.
- **Browser-Only Initialization**: Chart.js must be dynamically imported or initialized only in the browser (e.g., inside `$effect` or on mount) to avoid Server-Side Rendering (SSR) issues during SvelteKit static site generation.
- **Defensive Data Checks**: Always verify that `x` (timestamp) and `y` (numeric value) exist and are valid before passing points to Chart.js.
- **Auto Registration**: Use `chart.js/auto` to ensure all standard components and scales are registered.

### Troubleshooting Vite & Chart.js Errors

If you encounter caching issues or `504` dynamic-import errors related to Chart.js or its adapter:

1. Clear Vite's optimized cache: `rm -rf node_modules/.vite`
2. Restart the dev server with forced reoptimization: `npm run dev -- --force`

---

## 5. UI/UX & Design System

When creating or modifying UI components, refer to [DESIGN_SYSTEM.md](file:///home/jason/codebase/metrics-peloton-tread/DESIGN_SYSTEM.md) for styling patterns:

- **Theme**: Dark mode palette based on CSS variables defined in `src/app.css` (`--bg-primary`, `--bg-secondary`, `--accent-primary`, etc.).
- **Glassmorphism**: Use the `.glass-panel` utility class for cards, panels, and distinct visual blocks.
- **Typography & Components**: Standardize on system fonts (`Inter`), styled `.badge` elements, and responsive CSS Grid/Flexbox layouts with max container width of `1200px`.

---

## 6. Svelte MCP Server Tools

When working with Svelte code in environments connected to the Svelte MCP server:

- **`list-sections` & `get-documentation`**: Use to fetch up-to-date Svelte 5 and SvelteKit documentation when implementing Svelte-specific logic.
- **`svelte-autofixer`**: Run to analyze Svelte code and resolve any diagnostics or suggestions before completing tasks.
- **`playground-link`**: Only generate after user confirmation and never when code has been saved to files in the repository.

---

## 7. Testing, Verification & Code Quality

Always verify your changes before finalizing:

- **Tests**: `npm test -- --run` (Vitest with `jsdom`). Ensure any new utilities or stores have corresponding tests in `src/lib/tests/`.
- **Type Checking**: `npm run check` (`svelte-check`).
- **Linting & Formatting**: `npm run lint` and `npm run format` (ESLint + Prettier with Svelte plugins).
- **Build**: `npm run build` to verify static SPA compilation via `@sveltejs/adapter-static`.
