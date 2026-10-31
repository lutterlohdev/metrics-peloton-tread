---
name: feature-development
description: Methodical pipeline for developing new features, from initial understanding and planning through to branch creation, implementation, verification, and review.
---

# Feature Development Pipeline

Follow this methodical workflow when implementing new features or major enhancements to the Peloton Tread Metrics Dashboard.

## 1. Plan & Align

- Understand the problem and clarify any ambiguities with the user.
- Present a concrete implementation plan and obtain alignment before modifying code.

## 2. Branching & Isolation (Mandatory)

> [!IMPORTANT]
> **Never commit or merge directly to `master`.**

- If currently on `master`, check out `master`, fetch, and pull the latest changes.
- Create and switch to a descriptive feature branch (e.g., `git checkout -b feature/heartrate-chart`).

## 3. Implementation

- Adhere strictly to the project architecture in [AGENTS.md](../../../AGENTS.md):
  - Svelte 5 Runes only (`$state`, `$derived`, `$effect`, `$props`).
  - Client-side local processing only (zero server-side routes or external data transmission).
  - Defensive normalization in `src/lib/utils.js`.
  - Browser-only dynamic initialization for Chart.js.
  - Follow visual guidelines in [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md) (`.glass-panel`, CSS variables).

## 4. Verification & Testing

1. **Interactive / Visual Verification**:
   - Start the dev server (`npm run dev`) and inspect the local URL.
   - Use browser tools or preview to test the UI, click "Load Demo Data", and visually verify component rendering and chart interactivity.
2. **Unit Tests**:
   - Add unit tests in `src/lib/tests/` for any new data normalization, calculation, or store functions.
   - Run `npm test -- --run`.
3. **Type Checking & Linting**:
   - Run `npm run check` (`svelte-check`).
   - Run `npm run lint` and `npm run format`.
4. **Build Verification**:
   - Run `npm run build` to confirm static SPA bundling succeeds without SSR errors.

## 5. Review & Finalize

- Perform a self-review of code diffs to ensure no temporary debug code or unformatted files remain.
- Update documentation or [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md) if new reusable components or utilities were created.
- Commit the changes to the feature branch.
