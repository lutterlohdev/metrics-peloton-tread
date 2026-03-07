---
description: A methodical pipeline for developing new features, from initial understanding and planning through to implementation, review, and final styling.
---

1. Understand the problem and clarify any ambiguities. Present an implementation plan and wait for the user to accept it before proceeding.
2. Checkout the master branch, fetch and pull so its up to date.
3. Create a new branch appropriately named.
4. Develop the feature.
5. Once the feature is working, run `npm run dev` in the background. Read the terminal output to find the exact local URL and port (e.g. `http://localhost:5173/`). Use your AI Browser Agent (`browser_subagent`) to open that exact URL, click the "Load Demo Data" button to populate the dashboard with the demo dataset, and visually verify that the feature works as expected. Do not proceed until you have successfully verified the feature with the AI Browser Agent.
6. Add unit tests when appropriate.
7. Run linting/prettier.
8. Do a code review and ensure best practices are followed.
9. Add any appropriate updates to the `INSTRUCTIONS` file or `DESIGN_SYSTEM` readmes.
10. Commit the changes and push up to the new branch created earlier.