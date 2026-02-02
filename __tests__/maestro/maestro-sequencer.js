const { default: Sequencer } = require('@jest/test-sequencer');

const ORDER = ['auth-flow', 'post-flow', 'trade-flow'];

class MaestroSequencer extends Sequencer {
	sort(tests) {
		return tests.sort((a, b) => {
			const indexA = ORDER.findIndex((name) => a.path.includes(name));
			const indexB = ORDER.findIndex((name) => b.path.includes(name));
			return indexA - indexB;
		});
	}
}

module.exports = MaestroSequencer;
