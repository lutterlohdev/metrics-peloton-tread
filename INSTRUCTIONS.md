# Project Instructions: Peloton Metrics Dashboard

## Overview

This project is a privacy-focused, browser-based dashboard for analyzing Peloton workout data. Users can upload their Peloton workout history (CSV format), and the application will generate interactive charts and analytics to visualize progress over time.

## Core Philosophy
- **Privacy First**: There is no server-side component for data processing. All parsing and analysis happen locally in the user's browser. No data is sent to any external server.
- **Client-Side Only**: The application runs entirely in the browser.

## Tech Stack
Based on the current configuration:
- **Framework**: Svelte 5 (using Runes) with SvelteKit
- **Build Tool**: Vite
- **Linting/Formatting**: ESLint, Prettier

## Data Format
The application expects a CSV file exported from Peloton. See `src/data/sample.csv` for reference.

**Key Columns:**
- `Workout Timestamp`: Date and time of the workout.
- `Fitness Discipline`: E.g., Cycling, Strength, Yoga.
- `Total Output`: Total energy output (kj).
- `Avg. Watts`: Average power.
- `Avg. Speed (mph)`: Speed metrics.
- `Distance (mi)`: Distance covered.
- `Calories Burned`: Energy expenditure.
- `Avg. Heartrate`: Biometric data (if available).

## Features (implemented / in-progress notes)

### 1. Data Ingestion
- **File Upload**: A simple file-selection input is provided in `src/lib/components/CsvImporter.svelte`.
- **Parsing**: Uses `papaparse` for client-side CSV parsing.
- **Normalization & Defensive Cleanup**:
  - Blank/empty rows are filtered out before storing CSV results.
  - Numeric fields and timestamps are validated; rows with missing/invalid timestamps or numeric values are excluded from chart datasets.
  - Normalization helpers live in `src/lib/utils.js` and derived dataset logic in `src/lib/store.js`.

### 2. Analytics & Visualization
- **Output Over Time** chart (implemented):
  - Implemented as a canvas-based Chart.js chart in `src/lib/components/OutputOverTimeChart.svelte`.
  - Chart.js is dynamically imported in the browser using `chart.js/auto` and the `chartjs-adapter-date-fns` adapter is used for time scales.
  - Datasets are grouped by run length and contain (x: timestamp in ms, y: numeric output) points. Invalid points are skipped.
  - The component initializes with a default date range of the last 3 months; the date pickers are bound to that range and update the derived store filter.
  - A compact trend indicator (▲ / ▼ / —) is computed per dataset (first→last) and rendered under the chart.
  - The previous `svelte5-chartjs` rendering approach was replaced with a direct Chart.js constructor to avoid SSR/import issues.

### 3. Derived Data & Stores
- Derived stores live in `src/lib/store.js` (e.g., `runningWorkouts`, `outputOverTime`, `topFiveRunsByLength`).
- The `outputOverTime` derived store now returns an object `{ datasets }` where each dataset has `label`, `data` (array of {x, y}), and color styling.

## Development Guidelines & Troubleshooting

- Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) for reactivity.
- Ensure the UI is responsive.
- Maintain the privacy-first architecture (no API calls for data processing).

Troubleshooting notes (common issues encountered while developing):

- Chart.js dynamic import / Vite optimize issues:
  - Import Chart.js using `chart.js/auto` in the browser to ensure component registration is done for you.
  - Import the adapter via the package entrypoint: `chartjs-adapter-date-fns` (avoid importing internal dist paths which may not be exported and cause Vite import-analysis errors).
  - If you see errors like "Outdated Optimize Dep" or dynamic-import 504s for Chart.js-related deps, clear Vite's cached optimized dependencies and restart with forced reoptimization:

```bash
# remove Vite's dependency cache
rm -rf node_modules/.vite

# restart dev server with forced dependency optimization
npm run dev -- --force
```

- If problems persist, clear your browser cache or open the app in an incognito window to avoid stale module caching.

Development workflow:

```bash
npm install
npm run dev        # start dev server, visit the reported local URL
npm test           # run unit tests (if any)
```

## Notes on Dependencies
- `chart.js` and `chartjs-adapter-date-fns` are required by the chart component and must be present in `package.json`.
- `papaparse` is used for CSV parsing.
- `svelte5-chartjs` is no longer required for the primary chart rendering; the canonical implementation uses a direct Chart.js instance. Keep or remove `svelte5-chartjs` per preference.

## Testing & Next Steps
- Add unit tests for data normalization utilities in `src/lib/utils.js` and the dataset-building logic in `src/lib/store.js` to validate parsing, grouping, and filtering behavior.
- Consider adding a toggle to draw a dotted trendline per dataset (optional). A simple first/last slope indicator is already rendered as an arrow below the chart.
- Improve UI polish for trend indicators and add accessible text labels for screen readers.
