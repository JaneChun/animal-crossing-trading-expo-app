module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/__tests__'],
	testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.integration.test.ts'],
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
	coverageThreshold: {
		global: {
			branches: 80, // 분기 커버리지
			functions: 80, // 함수 커버리지
			lines: 80, // 라인 커버리지
			statements: 80, // 구문 커버리지
		},
	},
	verbose: true,
};
