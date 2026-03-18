---
name: animal-crossing-trading-expo-app-conventions
description: Development conventions and patterns for animal-crossing-trading-expo-app. TypeScript React project with conventional commits.
---

# Animal Crossing Trading Expo App Conventions

> Generated from [JaneChun/animal-crossing-trading-expo-app](https://github.com/JaneChun/animal-crossing-trading-expo-app) on 2026-03-18

## Overview

This skill teaches Claude the development patterns and conventions used in animal-crossing-trading-expo-app.

## Tech Stack

- **Primary Language**: TypeScript
- **Framework**: React
- **Architecture**: type-based module organization
- **Test Location**: separate
- **Test Framework**: jest

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 8 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `refactor`
- `fix`
- `feat`
- `chore`
- `perf`

### Message Guidelines

- Average message length: ~46 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: 채팅방에서 카메라 촬영으로 이미지 전송 기능 추가
```

*Commit message example*

```text
fix: 프로필 특정 정보 미표시 오류 수정
```

*Commit message example*

```text
ci: Claude Code Action에 프롬프트 추가
```

*Commit message example*

```text
refactor: CI/CD functions 관련 job 조건부 실행
```

*Commit message example*

```text
chore: package.json 스크립트 수정
```

*Commit message example*

```text
Merge pull request #29 from JaneChun/feat/chat-camera
```

*Commit message example*

```text
Merge pull request #28 from JaneChun/fix/profile-cache
```

*Commit message example*

```text
Merge pull request #26 from JaneChun/ci/optimize-workflows-and-add-husky
```

## Architecture

### Project Structure: Single Package

This project uses **type-based** module organization.

### Source Layout

```
src/
├── __tests__/
├── components/
├── config/
├── constants/
├── firebase/
├── hooks/
├── navigation/
├── screens/
├── stores/
├── theme/
```

### Configuration Files

- `.eslintrc.js`
- `.github/workflows/ci.yml`
- `.github/workflows/claude.yml`
- `.prettierrc`
- `functions/.eslintrc.js`
- `functions/jest.config.js`
- `functions/package.json`
- `functions/tsconfig.json`
- `jest.config.js`
- `package.json`
- `tsconfig.json`

### Guidelines

- Group code by type (components, services, utils)
- Keep related functionality in the same type folder
- Avoid circular dependencies between type folders

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Path Aliases (@/, ~/)

### Export Style: Named Exports


*Preferred import style*

```typescript
// Use path aliases for imports
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
```

*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
```

## Testing

### Test Framework: jest

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services

### Mocking: jest.mock


*Test file structure*

```typescript
import { describe, it, expect } from 'jest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Error Handling

### Error Handling Style: Error Boundaries

React **Error Boundaries** are used for graceful UI error handling.


## Common Workflows

These workflows were detected from analyzing commit patterns.

### Feature Development

Standard feature implementation workflow

**Frequency**: ~4 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `src/components/home/*`
- `src/constants/*`
- `src/hooks/ads/*`
- `**/*.test.*`

**Example commit sequence**:
```
feat: 홈 게시글 목록에 AdMob 네이티브 광고 설정
chore: 전면 광고 임시 비활성화
fix: NativeAd의 starRating 필드 undefined 체크 추가
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~11 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
Merge pull request #21 from JaneChun/refactor/post-soft-delete
refactor: 광고 미로드 시 빈 영역 제거 및 가변 높이 대응을 위한 getItemLayout 제거
refactor: 광고 설정(on/off, 간격)을 하드코딩 상수에서 Firestore 기반으로 전환
```

### Feature Development With Shared Hooks And Screens

Implements a new feature that involves both a shared hook and a screen, often updating configuration or permissions as well.

**Frequency**: ~1 times per month

**Steps**:
1. Update or create a shared hook in src/hooks/shared/
2. Update or create a screen in src/screens/
3. Update app.config.js if permissions or app metadata are needed

**Files typically involved**:
- `src/hooks/shared/*.ts`
- `src/screens/*.tsx`
- `app.config.js`

**Example commit sequence**:
```
Update or create a shared hook in src/hooks/shared/
Update or create a screen in src/screens/
Update app.config.js if permissions or app metadata are needed
```

### Ci Cd Workflow Setup Or Update

Adds or updates CI/CD related files, including GitHub Actions workflows, Husky hooks, and commit linting.

**Frequency**: ~1 times per month

**Steps**:
1. Create or update .github/workflows/*.yml for CI/CD pipelines
2. Add or update .husky/* for git hooks
3. Add or update commitlint.config.js
4. Update package.json and package-lock.json for dependencies

**Files typically involved**:
- `.github/workflows/*.yml`
- `.husky/*`
- `commitlint.config.js`
- `package.json`
- `package-lock.json`

**Example commit sequence**:
```
Create or update .github/workflows/*.yml for CI/CD pipelines
Add or update .husky/* for git hooks
Add or update commitlint.config.js
Update package.json and package-lock.json for dependencies
```

### Firebase Functions Feature Or Scheduler

Implements or updates Firebase Cloud Functions, especially for scheduled tasks or triggers, and updates related service/hooks/types.

**Frequency**: ~1 times per month

**Steps**:
1. Create or update function in functions/src/schedulers/ or functions/src/triggers/
2. Update functions/src/index.ts to register new schedulers/triggers
3. Update src/firebase/services/* for service logic
4. Update src/hooks/post/* or related hooks for frontend sync
5. Update src/types/* if data shape changes

**Files typically involved**:
- `functions/src/schedulers/*.ts`
- `functions/src/triggers/*.ts`
- `functions/src/index.ts`
- `src/firebase/services/*.ts`
- `src/hooks/post/*`
- `src/types/*.ts`

**Example commit sequence**:
```
Create or update function in functions/src/schedulers/ or functions/src/triggers/
Update functions/src/index.ts to register new schedulers/triggers
Update src/firebase/services/* for service logic
Update src/hooks/post/* or related hooks for frontend sync
Update src/types/* if data shape changes
```

### Refactor Any To Specific Types

Refactors code to replace 'any' types with more specific TypeScript types across components, hooks, and types files.

**Frequency**: ~2 times per month

**Steps**:
1. Identify usages of 'any' in components, hooks, or types
2. Replace 'any' with specific types or extract new types in src/types/
3. Update all affected files to use the new types

**Files typically involved**:
- `src/components/**/*.tsx`
- `src/hooks/**/*.ts`
- `src/types/**/*.ts`

**Example commit sequence**:
```
Identify usages of 'any' in components, hooks, or types
Replace 'any' with specific types or extract new types in src/types/
Update all affected files to use the new types
```

### Admob Native Ad Feature

Adds or updates AdMob native ad integration, involving components, hooks, constants, and sometimes Firestore.

**Frequency**: ~1 times per month

**Steps**:
1. Update or create ad-related components in src/components/Home/
2. Update or create ad-related hooks in src/hooks/ads/
3. Update ad constants in src/constants/ads.ts
4. Update Firestore rules or ad service if ad config is dynamic

**Files typically involved**:
- `src/components/Home/NativeAdUnit.tsx`
- `src/components/Home/PostList.tsx`
- `src/constants/ads.ts`
- `src/hooks/ads/*.ts`
- `firestore.rules`
- `src/firebase/services/adService.ts`

**Example commit sequence**:
```
Update or create ad-related components in src/components/Home/
Update or create ad-related hooks in src/hooks/ads/
Update ad constants in src/constants/ads.ts
Update Firestore rules or ad service if ad config is dynamic
```

### Profile Feature Or Design Update

Implements or updates profile-related features, including UI, constants, hooks, and types.

**Frequency**: ~1 times per month

**Steps**:
1. Update or create profile components in src/components/Profile/
2. Update or create hooks in src/hooks/profile/
3. Update constants in src/constants/profile.ts
4. Update types in src/types/user.ts

**Files typically involved**:
- `src/components/Profile/*.tsx`
- `src/hooks/profile/**/*.ts`
- `src/constants/profile.ts`
- `src/types/user.ts`

**Example commit sequence**:
```
Update or create profile components in src/components/Profile/
Update or create hooks in src/hooks/profile/
Update constants in src/constants/profile.ts
Update types in src/types/user.ts
```

### Fix Or Refactor Single Service Or Component

Fixes or refactors a single service or component file, often for bug fixes or code cleanup.

**Frequency**: ~2 times per month

**Steps**:
1. Identify the file with the issue
2. Make the fix or refactor
3. Commit only the affected file

**Files typically involved**:
- `src/firebase/services/*.ts`
- `src/components/**/*.tsx`
- `src/hooks/**/*.ts`

**Example commit sequence**:
```
Identify the file with the issue
Make the fix or refactor
Commit only the affected file
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Write tests using jest
- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't use long relative imports (use aliases)
- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
