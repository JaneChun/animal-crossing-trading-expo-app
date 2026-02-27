import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeAd } from 'react-native-google-mobile-ads';

import { AD_UNIT_IDS } from '@/constants/ads';

/**
 * 네이티브 광고 1개를 로드하고 관리하는 훅.
 * 컴포넌트 마운트 시 광고를 로드하고, 언마운트 시 리소스를 정리한다.
 */
export const useNativeAd = () => {
	const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const adRef = useRef<NativeAd | null>(null);

	const loadAd = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// 네이티브 광고 요청 생성
			const ad = await NativeAd.createForAdRequest(AD_UNIT_IDS.NATIVE);
			adRef.current = ad;
			setNativeAd(ad);
		} catch (err) {
			if (__DEV__) console.warn('Native ad load error:', err);
			setError(err instanceof Error ? err : new Error('Failed to load native ad'));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		// 컴포넌트 마운트 시 광고 로드
		loadAd();

		return () => {
			// 컴포넌트 언마운트 시 광고 정리
			adRef.current?.destroy();
			adRef.current = null;
		};
	}, [loadAd]);

	return { nativeAd, isLoading, error };
};
