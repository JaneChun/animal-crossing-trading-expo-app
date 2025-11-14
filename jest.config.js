module.exports = {
	projects: [
		// Configuration for Firebase Functions tests
		{
			displayName: 'functions',
			preset: 'ts-jest',
			testEnvironment: 'node',
			rootDir: 'functions', // Sets the root for this project to the 'functions' directory
			roots: ['<rootDir>/src', '<rootDir>/__tests__'],
			testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.integration.test.ts'],
			collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
			coverageThreshold: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
			verbose: true,
		},
		// Configuration for Maestro E2E tests
		{
			displayName: 'maestro',
			testEnvironment: 'node',
			rootDir: '.', // Sets the root for this project to the project root
			testMatch: ['<rootDir>/__tests__/maestro/**/*.test.js'],
			moduleFileExtensions: ['js', 'json'],
			transform: {
				'^.+.js$': 'babel-jest',
			},
			transformIgnorePatterns: [
				'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid|gaxios|gcp-metadata|google-auth-library)/)',
			],
			testTimeout: 120000,
		},
	],
};
