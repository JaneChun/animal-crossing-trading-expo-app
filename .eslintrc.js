module.exports = {
	extends: [
		'expo',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	plugins: ['unused-imports', 'import'],
	env: {
		browser: true,
		es2021: true,
		node: true,
		jest: true,
	},
	settings: {
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
		react: {
			version: 'detect',
		},
	},
	rules: {
		// 1. 불필요한 룰 삭제 및 수정
		'react/prop-types': 'off',
		'react/react-in-jsx-scope': 'off', // React 17+ 환경 대응

		// 2. Unused Imports (충돌 방지 설정)
		'no-unused-vars': 'off', // 기본 룰 끄기
		'@typescript-eslint/no-unused-vars': 'off', // TS 룰 끄기 (unused-imports가 담당)
		'unused-imports/no-unused-imports': 'error', // 사용하지 않는 import 삭제
		'unused-imports/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],

		// 3. Import Order
		'import/order': [
			'error',
			{
				groups: [
					'builtin', // 내장 모듈 (e.g., fs, path)
					'external', // 외부 라이브러리 (e.g., react, lodash)
					'internal', // 내부 모듈 (alias 경로)
					['parent', 'sibling', 'index'], // 상대 경로 import
					'type',
					'object',
				],
				'newlines-between': 'always', // 그룹 간 줄바꿈
				alphabetize: { order: 'asc', caseInsensitive: true }, // 알파벳 정렬
			},
		],
	},
	overrides: [
		{
			files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
			rules: {
				'@typescript-eslint/no-require-imports': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'unused-imports/no-unused-vars': 'off', // 테스트에선 유연하게 적용
			},
		},
	],
	ignorePatterns: ['/dist/*', '.expo/*', 'node_modules/*', 'functions/*'],
};
