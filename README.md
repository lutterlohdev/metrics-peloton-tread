# Peloton Tread Metrics Dashboard

A privacy-focused, browser-based dashboard for analyzing and visualizing your Peloton Tread workout data.

## Overview

This application allows you to upload your Peloton workout history (exported in CSV format) and instantly view interactive charts and analytics specifically focused on your Tread workouts to track your fitness progress over time.

**Privacy First:** There is no server-side processing or database. All parsing, analysis, and visualization happen completely locally in your browser. None of your workout data is sent to external servers.

## Key Features

- **Local CSV Processing**: Fast, client-side ingestion of your exported Peloton CSV files using PapaParse.
- **Interactive Visualizations**: Dynamic charts displaying metrics like Output Over Time (grouped by typical run lengths like 20m, 30m, 45m).
- **Trend Indicators**: Track your performance trajectory with built-in trend indicators calculated dynamically.
- **Data Normalization**: Handles missing data, cleans up timestamps, and ensures charts render smoothly.
- **Modern Svelte 5 Architecture**: Built entirely with Svelte 5 Runes for elegant reactivity.

## Tech Stack

- **Framework**: Svelte 5 (Runes) + SvelteKit
- **Build Tool**: Vite
- **Charting**: Chart.js (client-side only, via `chart.js/auto` & `chartjs-adapter-date-fns`)
- **Date Utilities**: date-fns
- **CSV Parsing**: PapaParse
- **Formatting & Linting**: ESLint & Prettier
- **Testing**: Vitest & jsdom

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm, pnpm, or yarn

### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd metrics-peloton-tread

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
# Create a production build (static SPA)
npm run build

# Preview the build locally
npm run preview
```

### Testing & Code Quality

```bash
# Run unit tests via Vitest
npm run test

# Check for linting and formatting issues
npm run lint

# Automatically fix formatting issues
npm run format
```

## How to Get Your Peloton Data

1. Log in to your account at [members.onepeloton.com](https://members.onepeloton.com/).
2. Navigate to your **Profile** > **Workouts**.
3. Click **Download Workouts** to obtain your `.csv` file.
4. Upload this file to the dashboard running locally to view your metrics!

## License

MIT License
