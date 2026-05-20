```markdown
# animal-crossing-trading-expo-app Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns and workflows used in the `animal-crossing-trading-expo-app`, a React application written in TypeScript. You'll learn about the project's coding conventions, how to add skeleton loading and UI primitive components, and how to follow the repository's commit and testing practices. This guide is ideal for contributors looking to maintain consistency and efficiency in their contributions.

## Coding Conventions

### File Naming

- **Component files** use **PascalCase**.
  - Example: `PostListSkeleton.tsx`, `ChatUnitSkeleton.tsx`
- **Test files** use the pattern `*.test.*`.
  - Example: `PostListSkeleton.test.tsx`

### Import Style

- **Alias imports** are preferred.
  - Example:
    ```typescript
    import PostListSkeleton from '@/components/Post/PostListSkeleton';
    ```

### Export Style

- **Default exports** are used for components and modules.
  - Example:
    ```typescript
    const PostListSkeleton = () => { /* ... */ };
    export default PostListSkeleton;
    ```

### Commit Messages

- Use **Conventional Commits** with prefixes like `feat` and `refactor`.
  - Example: `feat: add skeleton loading for post list`
- Average commit message length: ~51 characters.

## Workflows

### Add Skeleton Loading Component

**Trigger:** When you want to improve loading UX by showing skeleton placeholders for a list, detail, or profile view.  
**Command:** `/add-skeleton-loading`

1. **Create Skeleton Component(s):**
   - Add new skeleton component files in the relevant feature directory.
     - Example: `src/components/Post/PostListSkeleton.tsx`
   - Optionally, create unit skeletons if needed.
     - Example: `src/components/Post/PostUnitSkeleton.tsx`
2. **Integrate Skeleton in Main Component/Screen:**
   - Update the main component or screen to use the new Skeleton component during loading states.
     - Example:
       ```typescript
       import PostListSkeleton from '@/components/Post/PostListSkeleton';

       const PostListScreen = ({ isLoading, posts }) => (
         isLoading ? <PostListSkeleton /> : <PostList posts={posts} />
       );
       ```
3. **Files Involved:**
   - `src/components/<Feature>/*Skeleton.tsx`
   - `src/screens/<Feature>.tsx`
   - `src/components/<Feature>/<MainComponent>.tsx`

### Add UI Primitive Component

**Trigger:** When you want to introduce a new reusable UI primitive for use in other components.  
**Command:** `/add-ui-primitive`

1. **Create UI Primitive Component(s):**
   - Add new UI primitive component files in `src/components/ui/skeleton/`.
     - Example: `src/components/ui/skeleton/SkeletonBox.tsx`
2. **Export New Component(s):**
   - Update `src/components/ui/skeleton/index.ts` to export the new component(s).
     - Example:
       ```typescript
       export { default as SkeletonBox } from './SkeletonBox';
       export { default as SkeletonCircle } from './SkeletonCircle';
       ```
3. **Update Dependencies (if needed):**
   - Update `package.json` and `package-lock.json` if new dependencies or scripts are added.
4. **Files Involved:**
   - `src/components/ui/skeleton/*.tsx`
   - `src/components/ui/skeleton/index.ts`
   - `package.json`
   - `package-lock.json`

## Testing Patterns

- **Test files** follow the `*.test.*` pattern and are colocated with the components they test.
  - Example: `PostListSkeleton.test.tsx`
- **Testing framework** is not explicitly identified; check existing test files for conventions.

## Commands

| Command               | Purpose                                                        |
|-----------------------|----------------------------------------------------------------|
| /add-skeleton-loading | Add and integrate a skeleton loading component for a feature   |
| /add-ui-primitive     | Add a new UI primitive component to the shared UI library      |
```