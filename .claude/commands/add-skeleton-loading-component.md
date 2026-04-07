---
name: add-skeleton-loading-component
description: Workflow command scaffold for add-skeleton-loading-component in animal-crossing-trading-expo-app.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-skeleton-loading-component

Use this workflow when working on **add-skeleton-loading-component** in `animal-crossing-trading-expo-app`.

## Goal

Adds a new Skeleton loading UI component for a specific feature or section, and integrates it into the corresponding screen/component to handle loading states.

## Common Files

- `src/components/<Feature>/*Skeleton.tsx`
- `src/screens/<Feature>.tsx`
- `src/components/<Feature>/<MainComponent>.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create one or more new Skeleton component files in the relevant feature directory (e.g., PostListSkeleton, ChatListSkeleton, NotificationListSkeleton, etc.)
- Optionally create unit skeletons if needed (e.g., PostUnitSkeleton, ChatUnitSkeleton, NotificationUnitSkeleton, etc.)
- Update the main component or screen to use the new Skeleton component during loading states

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.