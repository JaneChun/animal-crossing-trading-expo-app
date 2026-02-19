import 'dotenv/config';

export default {
	expo: {
		name: '모동숲 마켓',
		slug: 'animal-crossing-trading-app',
		version: '1.5.0',
		orientation: 'portrait',
		icon: './assets/images/app_icon.jpg',
		scheme: 'animal-crossing-trading-app',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		splash: {
			image: './assets/images/splash_image.jpg',
			resizeMode: 'contain',
			backgroundColor: '#ffffff',
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.janechun.animalcrossingtradingapp',
			usesAppleSignIn: true,
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
			},
			splash: {
				image: './assets/images/splash_image.jpg',
				resizeMode: 'contain',
				backgroundColor: '#ffffff',
			},
			"googleServicesFile": process.env.GOOGLE_SERVICE_INFO_PLIST,
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
			'@react-native-firebase/app',
			[
				'expo-build-properties',
				{
					android: {
						extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
						newArchEnabled: true,
					},
					ios: {
						newArchEnabled: true,
						useFrameworks: 'static',
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
					photosPermission:
						'프로필 사진 및 게시글 이미지 첨부 기능을 제공하기 위해 사진 보관함 접근 권한이 필요합니다. 이 권한은 설정에서 언제든 변경할 수 있습니다.',
				},
			],
			[
				'@react-native-seoul/naver-login',
				{
					urlScheme: 'com.janechun.animalcrossingtradingapp',
				},
			],
			['expo-apple-authentication'],
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
