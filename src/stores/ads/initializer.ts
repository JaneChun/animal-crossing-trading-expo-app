import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

const requestTrackingPermission = async (): Promise<void> => {
	const { status } = await requestTrackingPermissionsAsync();
	if (__DEV__) {
		console.log('ATT permission status:', status);
	}
};

export const useAdMobInitializer = () => {
	useEffect(() => {
		const initializeAds = async () => {
			// 1. ATT 권한 요청 (iOS만)
			if (Platform.OS === 'ios') {
				try {
					await requestTrackingPermission();
				} catch (error) {
					if (__DEV__) {
						console.warn('ATT permission request failed:', error);
					}
				}
			}

			// 2. AdMob SDK 초기화
			try {
				await mobileAds().initialize();

				if (__DEV__) {
					console.log('AdMob SDK initialized');
				}
			} catch (error) {
				if (__DEV__) {
					console.warn('AdMob initialization failed:', error);
				}
			}
		};

		initializeAds();
	}, []);
};
