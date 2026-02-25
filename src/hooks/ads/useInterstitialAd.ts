import { useCallback, useEffect, useRef, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/ads';

export const useInterstitialAd = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const adRef = useRef<InterstitialAd | null>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	const loadAd = useCallback(() => {
		// 이전 광고의 리스너를 먼저 정리 (재귀 호출 시 누수 방지)
		cleanupRef.current?.();

		// 전면 광고 요청 생성
		const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL);

		// Admob 서버에서 광고 데이터를 받아오면 LOADED 이벤트 발생
		const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
			setIsLoaded(true);
		});

		// 사용자가 광고를 닫았을 때 CLOSED 이벤트 발생
		const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
			setIsLoaded(false);
			loadAd(); // 재귀 호출로 다음 광고를 미리 로드 (preloading 패턴)
		});

		// 네트워크 오류, 광고 재고 없음 등 광고 로드 실패 시 ERROR 이벤트 발생
		const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
			if (__DEV__) console.warn('Interstitial ad error:', error);
			setIsLoaded(false);
		});

		ad.load();
		adRef.current = ad;

		// 항상 최신 cleanup을 ref에 저장하여 언마운트 시 최신 리스너를 정리
		cleanupRef.current = () => {
			unsubscribeLoaded();
			unsubscribeClosed();
			unsubscribeError();
		};
	}, []);

	useEffect(() => {
		loadAd();
		return () => cleanupRef.current?.();
	}, [loadAd]);

	const showAd = useCallback((): Promise<void> => {
		return new Promise((resolve) => {
			// 광고가 준비되지 않았거나 참조가 없는 경우 즉시 resolve
			if (!adRef.current || !isLoaded) {
				resolve();
				return;
			}

			// 사용자가 광고를 닫았을 때 CLOSED 이벤트 발생
			const unsubscribeClosed = adRef.current.addAdEventListener(AdEventType.CLOSED, () => {
				cleanup();
				resolve();
			});

			// 광고 표시 중 오류 발생 시 ERROR 이벤트 발생
			const unsubscribeError = adRef.current.addAdEventListener(AdEventType.ERROR, () => {
				cleanup();
				resolve();
			});

			const cleanup = () => {
				unsubscribeClosed();
				unsubscribeError();
			};

			try {
				adRef.current.show();
			} catch {
				cleanup();
				resolve();
			}
		});
	}, [isLoaded]);

	return { isLoaded, showAd };
};
