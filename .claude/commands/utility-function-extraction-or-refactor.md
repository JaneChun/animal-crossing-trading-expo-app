---
name: utility-function-extraction-or-refactor
description: Workflow command scaffold for utility-function-extraction-or-refactor in animal-crossing-trading-expo-app.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /utility-function-extraction-or-refactor

Use this workflow when working on **utility-function-extraction-or-refactor** in `animal-crossing-trading-expo-app`.

## Goal

Refactoring or extracting utility functions from feature-specific files to shared utilities, or reorganizing utility logic for reuse and maintainability.

## Common Files

- `src/utilities/*.ts`
- `src/components/**/*.tsx`
- `src/firebase/services/*.ts`
- `src/__tests__/utilities/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify reusable logic in a feature or service file.
- Extract the logic into a new or existing utility file in src/utilities/.
- Update all references in the original and related files to use the new utility.
- Optionally, add or update tests for the utility.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.