import { useEffect } from 'react';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

export const useAdMobInitializer = () => {
	useEffect(() => {
		const initializeAds = async () => {
			try {
				// AdMob SDK 초기화
				await mobileAds().initialize();

				if (__DEV__) {
					console.log('AdMob SDK initialized');
				}
			} catch (error) {
				// 광고 SDK 실패로 앱이 크래시되면 안 됨
				if (__DEV__) {
					console.warn('AdMob initialization failed:', error);
				}
			}
		};

		initializeAds();
	}, []);
};
