// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK v10은 Metro의 package.json "exports" 해석(SDK 53+ 기본 활성화)과
// 비호환("Component auth has not been registered yet" 등). v12+ 업그레이드 전까지 비활성화.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
