export interface AdConfig {
	isNativeAdsEnabled: boolean;
	nativeAdInterval: number;
	isInterstitialAdsEnabled: boolean;
}

export interface AdState {
	adConfig: AdConfig;
	setAdConfig: (config: AdConfig) => void;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
	isNativeAdsEnabled: false,
	nativeAdInterval: 10,
	isInterstitialAdsEnabled: false,
};
