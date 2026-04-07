---
name: add-ui-primitive-component
description: Workflow command scaffold for add-ui-primitive-component in animal-crossing-trading-expo-app.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ui-primitive-component

Use this workflow when working on **add-ui-primitive-component** in `animal-crossing-trading-expo-app`.

## Goal

Adds new basic UI primitive components (e.g., SkeletonBox, SkeletonCircle, SkeletonText) to the shared UI library and updates the index for exports.

## Common Files

- `src/components/ui/skeleton/*.tsx`
- `src/components/ui/skeleton/index.ts`
- `package.json`
- `package-lock.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new UI primitive component file(s) in src/components/ui/skeleton/
- Update src/components/ui/skeleton/index.ts to export the new component(s)
- Update package.json and package-lock.json if dependencies or scripts are affected

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.