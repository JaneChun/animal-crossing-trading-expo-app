// eslint-disable-next-line @typescript-eslint/no-require-imports
const ts = require('typescript');

module.exports = {
	process(sourceText, sourcePath) {
		const { outputText } = ts.transpileModule(sourceText, {
			fileName: sourcePath,
			compilerOptions: {
				esModuleInterop: true,
				jsx: ts.JsxEmit.React,
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2019,
			},
		});

		return { code: outputText };
	},
};
