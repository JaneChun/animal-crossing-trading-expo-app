module.exports = {
	testSequencer: './__tests__/maestro/maestro-sequencer.js',
	projects: [
		{
			displayName: 'maestro',
			testEnvironment: 'node',
			rootDir: '.',
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
	],
};
