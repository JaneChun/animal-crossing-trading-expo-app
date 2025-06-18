import 'dotenv/config';

export default {
	expo: {
		name: 'animal-crossing-trading-app',
		slug: 'animal-crossing-trading-app',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/images/app_icon.png',
		scheme: 'animal-crossing-trading-app',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.janechun.animalcrossingtradingapp',
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/images/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			package: 'com.janechun.animalcrossingtradingapp',
		},
		web: {
			bundler: 'metro',
			output: 'static',
			favicon: './assets/images/favicon.png',
		},
		plugins: [
			[
				'expo-build-properties',
				{
					android: {
						extraMavenRepos: [
							'https://devrepo.kakao.com/nexus/content/groups/public/',
						],
						newArchEnabled: true,
					},
					ios: {
						newArchEnabled: true,
					},
				},
			],
			[
				'@react-native-kakao/core',
				{
					nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY,
					android: {
						authCodeHandlerActivity: true,
					},
					ios: {
						handleKakaoOpenUrl: true,
					},
				},
			],
			[
				'expo-image-picker',
				{
					photosPermission: '사진 업로드를 위해 갤러리 접근 권한이 필요합니다.',
				},
			],
			[
				'@react-native-seoul/naver-login',
				{
					urlScheme: 'com.janechun.animalcrossingtradingapp',
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			router: {
				origin: false,
			},
			eas: {
				projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
			},
		},
		owner: 'janechun',
	},
};
