import { useEffect, useState } from 'react';
import { checkAppVersion, VersionCheckResult } from '../../firebase/services/versionService';

interface UseVersionCheckReturn {
	updateInfo: VersionCheckResult | null;
	isLoading: boolean;
	error: string | null;
	recheckVersion: () => Promise<void>;
}

export const useVersionCheck = (): UseVersionCheckReturn => {
	const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	return {
		updateInfo,
		isLoading,
		error,
		recheckVersion: performVersionCheck,
	};
};
