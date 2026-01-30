module.exports = {
	projects: [
		// Configuration for Maestro E2E tests
		{
			displayName: 'maestro',
			testEnvironment: 'node',
			rootDir: '.', // Sets the root for this project to the project root
			testMatch: ['<rootDir>/__tests__/maestro/**/*.test.js'],
			moduleFileExtensions: ['js', 'json'],
			moduleNameMapper: {
				'^@/(.*)$': '<rootDir>/src/$1',
			},
			transform: {
				'^.+.js$': 'babel-jest',
			},
			transformIgnorePatterns: [
				'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid|gaxios|gcp-metadata|google-auth-library)/)',
			],
		},
		// Configuration for App unit tests
		{
			displayName: 'app',
			preset: 'jest-expo',
			testEnvironment: 'node',
			rootDir: '.',
			roots: ['<rootDir>/src'],
			testMatch: ['<rootDir>/src/__tests__/**/*.test.ts', '<rootDir>/src/__tests__/**/*.test.tsx'],
			moduleNameMapper: {
				'^@/(.*)$': '<rootDir>/src/$1',
			},
			transformIgnorePatterns: [
				'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)/)',
			],
		},
	],
};
