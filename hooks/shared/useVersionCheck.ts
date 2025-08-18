import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { checkAppVersion, VersionCheckResult } from '../../firebase/services/versionService';

interface UseVersionCheckReturn {
	updateInfo: VersionCheckResult | null;
	isLoading: boolean;
	error: string | null;
	recheckVersion: () => Promise<void>;
	isUpdateModalVisible: boolean;
	handleCloseUpdateModal: () => void;
}

export const useVersionCheck = (): UseVersionCheckReturn => {
	const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

	// 앱 상태 추적을 위한 ref
	const appState = useRef(AppState.currentState);
	const wasModalVisibleWhenBackgrounded = useRef(false);

	const performVersionCheck = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const result = await checkAppVersion();
			setUpdateInfo(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : '버전 체크에 실패했습니다.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		performVersionCheck();
	}, []);

	// 업데이트 모달 표시 조건
	useEffect(() => {
		if (isLoading) return;

		if (updateInfo?.isUpdateRequired) {
			setIsUpdateModalVisible(true);
		} else {
			setIsUpdateModalVisible(false);
		}
	}, [isLoading, updateInfo]);

	// AppState 변화 감지 및 백그라운드 복귀 시 버전 재체크
	useEffect(() => {
		const subscription = AppState.addEventListener('change', async (nextState) => {
			const prev = appState.current;

			// 액티브 → 백그라운드 전환 시 모달 표시 상태 저장
			if (prev.match(/active|foreground/) && nextState === 'background') {
				wasModalVisibleWhenBackgrounded.current = isUpdateModalVisible;
			}

			// 백그라운드 → 액티브 전환 시 버전 재체크
			if (prev === 'background' && nextState === 'active') {
				// 모달이 표시된 상태에서 백그라운드로 갔다가 돌아온 경우에만 재체크
				if (wasModalVisibleWhenBackgrounded.current) {
					await performVersionCheck();
					wasModalVisibleWhenBackgrounded.current = false;
				}
			}

			appState.current = nextState;
		});

		return () => {
			subscription.remove();
		};
	}, [isUpdateModalVisible]);

	const handleCloseUpdateModal = () => {
		if (updateInfo?.isForceUpdate) {
			return;
		}

		setIsUpdateModalVisible(false);
	};

	return {
		updateInfo,
		isLoading,
		error,
		recheckVersion: performVersionCheck,
		isUpdateModalVisible,
		handleCloseUpdateModal,
	};
};
