module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['/lib/**/*', '/node_modules/**/*'],
	rules: {
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-var-requires': 'off',
	},
	overrides: [
		{
			files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
			env: { jest: true },
			rules: {
				'@typescript-eslint/no-empty-function': 'off',
			},
		},
	],
};
