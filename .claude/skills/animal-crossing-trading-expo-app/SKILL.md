```markdown
# animal-crossing-trading-expo-app Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `animal-crossing-trading-expo-app` TypeScript codebase. You'll learn how to structure code, refactor utilities, extend features, develop bulk features, and write effective tests following the repository's established practices. This guide is ideal for contributors aiming for consistency and maintainability in a codebase without a formal framework.

## Coding Conventions

- **File Naming:**  
  Use **PascalCase** for file names, e.g., `BulkAddItem.tsx`, `ItemMatcher.ts`.

- **Import Style:**  
  Use **alias imports** for clarity and maintainability.
  ```typescript
  import ItemMatcher from 'src/utilities/ItemMatcher';
  ```

- **Export Style:**  
  Use **default exports** for modules.
  ```typescript
  // src/utilities/ItemMatcher.ts
  const ItemMatcher = () => { /* ... */ };
  export default ItemMatcher;
  ```

- **Commit Messages:**  
  Follow **conventional commit** types:  
  `refactor`, `chore`, `fix`, `feat`, `perf`, `test`, `docs`  
  Example:  
  ```
  feat: add bulk item matching utility
  ```

## Workflows

### Utility Function Extraction or Refactor
**Trigger:** When you want to reuse logic across features or clean up duplicated code  
**Command:** `/extract-utility`

1. Identify reusable logic in a feature or service file.
2. Extract the logic into a new or existing utility file in `src/utilities/`.
3. Update all references in the original and related files to use the new utility.
4. Optionally, add or update tests for the utility.

**Example:**
```typescript
// Before (in a component)
function matchItems(a, b) { /* ...logic... */ }

// After (in src/utilities/ItemMatcher.ts)
const matchItems = (a, b) => { /* ...logic... */ };
export default matchItems;

// In component
import matchItems from 'src/utilities/ItemMatcher';
```

### Feature Refactor with Type and Constant Updates
**Trigger:** When you want to change or extend the behavior of a feature (e.g., add limits, change matching logic)  
**Command:** `/refactor-feature`

1. Update or add constants in `src/constants/`.
2. Update or add type definitions in `src/types/`.
3. Modify or add hooks in `src/hooks/` to implement new logic.
4. Update related components in `src/components/` to use the new logic.
5. Optionally, update or add tests.

**Example:**
```typescript
// src/constants/post.ts
export const MAX_ITEMS = 20;

// src/types/Post.ts
export type Post = { id: string; items: Item[]; };

// src/hooks/usePostLimit.ts
import { MAX_ITEMS } from 'src/constants/post';
export default function usePostLimit(items: Item[]) {
  return items.length <= MAX_ITEMS;
}
```

### Bulk Feature Development with UI, Types, Hooks
**Trigger:** When you want to add a complex feature that spans UI, business logic, and data processing  
**Command:** `/new-bulk-feature`

1. Create or update multiple UI components in a dedicated folder (e.g., `src/components/NewPost/BulkAddItem/`).
2. Add or update hooks in `src/hooks/` to manage state and logic.
3. Define or update types in `src/types/` to support the new feature.
4. Implement or update utility functions in `src/utilities/`.
5. Update constants as needed.
6. Update or add tests in `src/__tests__/utilities/`.
7. Wire up the feature in screens or parent components.

**Example:**
```typescript
// src/components/NewPost/BulkAddItem/BulkAddForm.tsx
import useBulkAdd from 'src/hooks/item/useBulkAdd';
import { BulkItem } from 'src/types/bulkItemMatching';

// src/utilities/bulkItemMatching.ts
export default function matchBulkItems(items: BulkItem[]) { /* ... */ }
```

### Test Addition or Update for Utilities
**Trigger:** When you add or change utility logic and want to ensure correctness  
**Command:** `/add-utility-tests`

1. Create or update test files in `src/__tests__/utilities/`.
2. Write or update test cases to cover new or changed utility functions.
3. Run tests to verify correctness.

**Example:**
```typescript
// src/__tests__/utilities/ItemMatcher.test.ts
import matchItems from 'src/utilities/ItemMatcher';

test('matches items correctly', () => {
  expect(matchItems(a, b)).toBe(true);
});
```

## Testing Patterns

- **Framework:** [Jest](https://jestjs.io/)
- **Test File Pattern:**  
  Place tests alongside utilities in `src/__tests__/utilities/*.test.ts`.
- **Test Example:**
  ```typescript
  // src/__tests__/utilities/SomeUtility.test.ts
  import someUtility from 'src/utilities/SomeUtility';

  describe('someUtility', () => {
    it('should do something', () => {
      expect(someUtility(input)).toEqual(expected);
    });
  });
  ```

## Commands

| Command              | Purpose                                                      |
|----------------------|--------------------------------------------------------------|
| /extract-utility     | Extract or refactor utility functions for reuse              |
| /refactor-feature    | Refactor or extend a feature with updates to types/constants |
| /new-bulk-feature    | Develop a new bulk feature across UI, hooks, and utilities   |
| /add-utility-tests   | Add or update unit tests for utility functions               |
```