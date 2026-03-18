---
name: feature-development-with-shared-hooks-and-screens
description: Workflow command scaffold for feature-development-with-shared-hooks-and-screens in animal-crossing-trading-expo-app.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-with-shared-hooks-and-screens

Use this workflow when working on **feature-development-with-shared-hooks-and-screens** in `animal-crossing-trading-expo-app`.

## Goal

Implements a new feature that involves both a shared hook and a screen, often updating configuration or permissions as well.

## Common Files

- `src/hooks/shared/*.ts`
- `src/screens/*.tsx`
- `app.config.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update or create a shared hook in src/hooks/shared/
- Update or create a screen in src/screens/
- Update app.config.js if permissions or app metadata are needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.