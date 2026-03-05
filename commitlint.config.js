module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'subject-case': [0],
		'body-max-line-length': [0],
		'type-enum': [
			2,
			'always',
			['feat', 'design', 'fix', 'chore', 'docs', 'perf', 'ci', 'style', 'refactor'],
		],
	},
};
