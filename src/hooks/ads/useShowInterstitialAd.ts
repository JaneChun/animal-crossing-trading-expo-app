import { useCallback } from 'react';

import { useAdConfig } from '@/stores/ads';

import { useInterstitialAd } from './useInterstitialAd';

/**
 * 전면광고 표시를 관리하는 훅.
 * 광고 로드/표시를 추상화하고, 표시 전략을 제어합니다.
 */
export const useShowInterstitialAd = () => {
	const { isInterstitialAdsEnabled } = useAdConfig();
	const { isLoaded, showAd } = useInterstitialAd(isInterstitialAdsEnabled);

	/**
	 * 광고 표시를 시도합니다.
	 * 광고가 로드되지 않았으면 아무것도 하지 않고 넘어갑니다.
	 * 광고가 닫힐 때까지 대기 후 resolve됩니다.
	 */
	const showAdIfReady = useCallback(async () => {
		if (!isLoaded) return;

		if (!shouldShowAd()) return;

		await showAd();
	}, [isLoaded, showAd]);

	return { showAdIfReady };
};

/**
 * 광고 표시 여부를 결정하는 전략 함수.
 * 현재는 항상 true를 반환합니다.
 */
const shouldShowAd = (): boolean => {
	return true;
};
