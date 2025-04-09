import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// 온라인 상태 관리
// React Query는 이미 웹 브라우저에서 재접속 시 자동 새로고침을 지원합니다.
// React Native에서 이 동작을 추가하려면 React Query onlineManager를 사용해야 합니다.
export function useAppState() {
	onlineManager.setEventListener((setOnline) => {
		return NetInfo.addEventListener((state) => {
			setOnline(!!state.isConnected);
		});
	});
}
