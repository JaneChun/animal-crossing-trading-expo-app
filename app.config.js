import 'dotenv/config';

export default {
	expo: {
		name: '모동숲 마켓',
		slug: 'animal-crossing-trading-app',
		version: '1.9.0',
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
				FirebaseAutomaticScreenReportingEnabled: false,
			},
			splash: {
				image: './assets/images/splash_image.jpg',
				resizeMode: 'contain',
				backgroundColor: '#ffffff',
			},
			googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST,
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
			output: 'single',
			favicon: './assets/images/favicon.png',
		},
		plugins: [
			'expo-font',
			'expo-web-browser',
			'@react-native-firebase/app',
			[
				'expo-build-properties',
				{
					android: {
						extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
					},
					ios: {
						useFrameworks: 'static',
						// 프리컴파일 React-Core는 useFrameworks(static)와 비호환 — 런타임에서
						// 모듈 레지스트리가 깨져 "AccessibilityManager is nil" 크래시. 소스 빌드 강제.
						buildReactNativeFromSource: true,
						// SDK 54 + RN 0.81 프리컴파일 React-Core에서 RNFB framework 모듈이
						// 비모듈러 헤더(RCTConvert.h)를 include하며 빌드 실패 → 정적 링크로 회피
						// https://github.com/expo/expo/issues/39607
						forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
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
					cameraPermission:
						'채팅에서 사진을 촬영하여 전송하기 위해 카메라 접근 권한이 필요합니다. 이 권한은 설정에서 언제든 변경할 수 있습니다.',
				},
			],
			[
				'@react-native-seoul/naver-login',
				{
					urlScheme: 'com.janechun.animalcrossingtradingapp',
				},
			],
			['expo-apple-authentication'],
			['expo-tracking-transparency'],
			[
				'react-native-google-mobile-ads',
				{
					iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
					userTrackingUsageDescription:
						'맞춤형 광고 제공을 위해 기기 식별자에 접근합니다. 설정에서 언제든 변경할 수 있습니다.',
					skAdNetworkItems: ['wzmmz9fp6w.skadnetwork', '22mmun2rn5.skadnetwork'],
				},
			],
		],
		extra: {
			eas: {
				projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
			},
		},
		owner: 'janechun',
	},
};
