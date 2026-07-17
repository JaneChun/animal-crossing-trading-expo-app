---
name: feature-refactor-with-type-and-constant-updates
description: Workflow command scaffold for feature-refactor-with-type-and-constant-updates in animal-crossing-trading-expo-app.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-refactor-with-type-and-constant-updates

Use this workflow when working on **feature-refactor-with-type-and-constant-updates** in `animal-crossing-trading-expo-app`.

## Goal

Refactoring or extending a feature involves updating constants, types, and related hooks/components to support new logic or constraints.

## Common Files

- `src/constants/*.ts`
- `src/types/*.ts`
- `src/hooks/**/*.ts`
- `src/components/**/*.tsx`
- `src/__tests__/**/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update or add constants in src/constants/.
- Update or add type definitions in src/types/.
- Modify or add hooks in src/hooks/ to implement new logic.
- Update related components in src/components/ to use the new logic.
- Optionally, update or add tests.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.