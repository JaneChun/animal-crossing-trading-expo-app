const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    return tests.sort((a, b) => {
      const getPriority = (path) => {
        if (path.includes('auth-flow')) return 3;
        if (path.includes('post-flow')) return 2;
        if (path.includes('trading-flow')) return 1;
        return 0;
      };
      
      const aPriority = getPriority(a.path);
      const bPriority = getPriority(b.path);
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // 높은 우선순위 먼저
      }
      
      return a.path.localeCompare(b.path);
    });
  }
}

module.exports = CustomSequencer;