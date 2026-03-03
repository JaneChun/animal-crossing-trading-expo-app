module.exports = {
	root: true,
	env: {
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier', // 포맷팅 충돌 방지
	],
	plugins: ['@typescript-eslint', 'unused-imports'],
	ignorePatterns: [
		'/lib/**/*', // 빌드 결과물 제외
		'/node_modules/**/*',
		'/__tests__/**/*',
		'*.test.ts',
		'*.spec.ts',
	],
	rules: {
		// 1. 타입 관련 룰 완화
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off', // 함수 리턴 타입 강제 안 함
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/ban-ts-comment': 'off', // @ts-ignore 허용

		// 2. 비동기 작업 안정성
		'no-async-promise-executor': 'warn',
		'no-await-in-loop': 'warn',

		// 3. 미사용 변수 및 정리
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'unused-imports/no-unused-imports': 'error',
		'unused-imports/no-unused-vars': [
			'warn',
			{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
		],
	},
};
