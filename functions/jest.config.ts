/**
 * Jest 설정 파일
 * Firebase Functions 테스트 환경 구성
 */
import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/__tests__'],
	testMatch: ['**/*.test.ts'],
	setupFilesAfterEnv: ['<rootDir>/__tests__/helpers/setup.ts'],
	moduleFileExtensions: ['ts', 'js'],
	collectCoverageFrom: ['src/**/*.ts', '!src/migration/**'],
	coverageDirectory: 'coverage',
	clearMocks: true,
	testTimeout: 10000,
	maxWorkers: 1, // 통합 테스트가 Firestore 에뮬레이터를 공유하므로 순차 실행 필요
};

export default config;
