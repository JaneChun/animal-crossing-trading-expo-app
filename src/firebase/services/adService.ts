import { doc, getDoc, Timestamp } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { AdConfig, DEFAULT_AD_CONFIG } from '@/stores/ads/types';

interface FirestoreAdConfig {
	is_native_ads_enabled: boolean;
	native_ad_interval: number;
	is_interstitial_ads_enabled: boolean;
	updated_at: Timestamp;
}

export const fetchAdConfig = async (): Promise<AdConfig> => {
	try {
		const configRef = doc(db, 'app_config', 'ad_config');
		const configSnap = await getDoc(configRef);

		if (!configSnap.exists()) {
			if (__DEV__) {
				console.log('❌ Ad config not found, using defaults');
			}
			return DEFAULT_AD_CONFIG;
		}

		const config = configSnap.data() as FirestoreAdConfig;

		return {
			isNativeAdsEnabled:
				config.is_native_ads_enabled ?? DEFAULT_AD_CONFIG.isNativeAdsEnabled,
			nativeAdInterval: config.native_ad_interval ?? DEFAULT_AD_CONFIG.nativeAdInterval,
			isInterstitialAdsEnabled:
				config.is_interstitial_ads_enabled ?? DEFAULT_AD_CONFIG.isInterstitialAdsEnabled,
		};
	} catch (error) {
		if (__DEV__) {
			console.warn('Ad config fetch failed, using defaults:', error);
		}
		return DEFAULT_AD_CONFIG;
	}
};
