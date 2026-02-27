// ─── Test Ad Unit IDs (Google 공식 테스트 ID - 개발 중 안전하게 사용) ─────────────
const TEST_IDS = {
	INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
	NATIVE_IOS: 'ca-app-pub-3940256099942544/3986624511',
};

// ─── Production Ad Unit IDs (AdMob 콘솔에서 발급받은 광고 단위 ID) ───────────────
const PROD_IDS = {
	INTERSTITIAL_IOS: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID ?? '',
	NATIVE_IOS: process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS_ID ?? '',
};

// __DEV__ 플래그로 테스트/프로덕션 자동 전환
const IDS = __DEV__ ? TEST_IDS : PROD_IDS;

// ─── 광고 단위 ID ──────────────────────────────────────────────────────────────────
export const AD_UNIT_IDS = {
	INTERSTITIAL: IDS.INTERSTITIAL_IOS,
	NATIVE: IDS.NATIVE_IOS,
};

// ─── 광고 표시 간격 ─────────────────────────────────────────────────────────────────
/** 네이티브 광고가 삽입되는 게시글 간격 */
export const NATIVE_AD_INTERVAL = 10;
