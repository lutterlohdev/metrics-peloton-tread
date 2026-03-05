# AI Assistant / Copilot Instructions

When contributing to the **Peloton Tread Metrics Dashboard**, please adhere strictly to the following architectural guidelines and coding standard rules. Note that this project is specifically tailored for analyzing Peloton Tread workouts.

## Core Philosophy & Architecture

1. **Privacy First & Local-Only:** 
   - All data processing must happen client-side in the browser.
   - Do **NOT** add any server-side routes, API endpoints for user data, or database interactions.
   - The user's CSV data is their own, and it must never leave their browser or be transmitted over the internet.
2. **Framework:** 
   - We use **Svelte 5** exclusively via **SvelteKit**.
   - Your code must utilize the new **Svelte 5 Runes** system (`$state`, `$derived`, `$effect`, `$props`). Do not use legacy Svelte 4 reactivity patterns (e.g., `export let`, `$:`, `<script context="module">`).
3. **Build Tool:**
   - Powered by **Vite**. Keep dependencies modern and fast.

## Data Processing Flow

1. **Ingestion:** Data is ingested via a file input in `src/lib/components/CsvImporter.svelte` and parsed using `papaparse`.
2. **Normalization:** Extracted data goes through normalization functions in `src/lib/utils.js`. Ensure you filter out blank or malformed rows, and defensively check numeric fields and timestamps.
3. **State Management:** The processed dataset is stored and derived using Svelte 5 state in `src/lib/store.js`.

## Charting Guidelines

- **Library:** We use `chart.js` directly.
- **Browser-Only Initialization:** Chart.js must be dynamically imported or initialized only in the browser to avoid Server-Side Rendering (SSR) issues in SvelteKit.
- Use `chart.js/auto` to ensure components are registered automatically.
- Use `chartjs-adapter-date-fns` for time scaling on charts.
- Maintain defensive checks when rendering charts: always confirm `x` (timestamp) and `y` (numeric value) exist before passing data to Chart.js.

## Troubleshooting Vite & Chart.js Errors

If you encounter caching issues or `504` dynamic-import errors related to Chart.js or its adapter:
1. Clear Vite's optimized dependencies cache: `rm -rf node_modules/.vite`
2. Restart the dev server with forced reoptimization: `npm run dev -- --force`
3. If problems persist, tell the user to clear their browser cache or use an incognito window if the application acts stale.

## MCP Tools & Verification (for Gemini)

- If using the Gemini agent, utilize the `svelte-autofixer` MCP tool to analyze generated Svelte code for issues or suggestions *before* presenting the final code to the user.
- If the user asks about Svelte topics, leverage `list-sections` and `get-documentation` from the Svelte MCP server to ensure accuracy.

## Testing & Code Quality

- **Testing**: We use **Vitest** for unit testing (with `jsdom` for any component-level rendering, if needed). Run `npm run test`.
- **Linting & Formatting**: We use **ESLint** and **Prettier** along with `eslint-plugin-svelte` and `prettier-plugin-svelte`.
  - Always run `npm run lint` and `npm run format` to ensure your code matches the project guidelines before finalizing any implementation.

## Current & Next Steps

- **Completed:** Client-side CSV upload parsing, Output Over Time Chart.
- **Upcoming Work:** 
  - Add tests for data normalization (`src/lib/utils.js`).
  - Implement new chart types (e.g., Heartrate over time, specific fitness discipline breakdowns).
  - Add UI toggles and polish overall accessibility.
