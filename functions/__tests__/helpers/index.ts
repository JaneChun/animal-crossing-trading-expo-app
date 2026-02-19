/**
 * 테스트 헬퍼 모듈 인덱스
 * 모든 헬퍼를 한 곳에서 import 가능하게 함
 *
 * Note: emulator 헬퍼는 firebase-admin을 직접 import하므로
 * 여기에서 re-export하면 unit test에서 jest.mock 충돌 발생할 수 있음
 * 통합 테스트에서는 '../helpers/emulator'에서 직접 import할 것
 */

// Mock 팩토리 (unit test용)
export * from './mocks';

// Fixture 팩토리 (unit test / integration test 공용)
export * from './fixtures';

// Emulator 헬퍼는 직접 import 필요:
// import { createTestApp } from '../helpers/emulator';
