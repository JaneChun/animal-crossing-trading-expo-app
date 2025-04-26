module.exports = {
	extends: [
		'expo',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:prettier/recommended',
	],
	plugins: ['unused-imports', 'import', 'react-hooks', '@typescript-eslint'],
	rules: {
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
		'import/order': [
			'error',
			{
				groups: [
					'builtin', // 내장 모듈 (e.g., fs, path)
					'external', // 외부 라이브러리 (e.g., react, lodash)
					'internal', // 내부 모듈 (alias 경로)
					['parent', 'sibling', 'index'], // 상대 경로 import
					'type',
					'unknown',
				],
				'newlines-between': 'always', // 그룹 간 줄바꿈
				alphabetize: { order: 'asc', caseInsensitive: true }, // 알파벳 정렬
			},
		],
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
	},
	ignorePatterns: ['/dist/*'], // dist 폴더 무시
};
