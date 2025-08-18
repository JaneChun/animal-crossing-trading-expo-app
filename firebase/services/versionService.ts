import * as Application from 'expo-application';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../../fbase';

export interface VersionCheckResult {
	isUpdateRequired: boolean;
	isForceUpdate: boolean;
	messages: string[];
	storeUrl?: string;
}

interface AppVersionConfig {
	minimum_version: string;
	force_update: boolean;
	update_message: string[];
	store_urls: {
		ios: string;
		android: string;
	};
	updated_at: Timestamp;
}

const compareVersions = (current: string, minimum: string): number => {
	const currentParts = current.split('.').map(Number);
	const minimumParts = minimum.split('.').map(Number);

	for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i++) {
		const currentPart = currentParts[i] || 0;
		const minimumPart = minimumParts[i] || 0;

		if (currentPart < minimumPart) return -1;
		if (currentPart > minimumPart) return 1;
	}
	return 0;
};

const getCurrentVersion = (): string => {
	return Application.nativeApplicationVersion || '1.0.0';
};

const getStoreUrl = (config: AppVersionConfig): string => {
	return Platform.OS === 'ios' ? config.store_urls?.ios : config.store_urls?.android;
};

export const checkAppVersion = async (): Promise<VersionCheckResult> => {
	try {
		// Firestore에서 버전 설정 가져오기
		const configRef = doc(db, 'app_config', 'version_control');
		const configSnap = await getDoc(configRef);

		if (!configSnap.exists()) {
			console.log('❌ Version config not found');
			return {
				isUpdateRequired: false,
				isForceUpdate: false,
				messages: [],
			};
		}

		const config = configSnap.data() as AppVersionConfig;
		const currentVersion = getCurrentVersion();

		console.log('📱 Current version:', currentVersion);
		console.log('🔧 Minimum version:', config.minimum_version);

		const isUpdateRequired = compareVersions(currentVersion, config.minimum_version) < 0;

		const result = {
			isUpdateRequired,
			isForceUpdate: config.force_update && isUpdateRequired,
			messages: config.update_message ?? [],
			storeUrl: getStoreUrl(config),
		};

		console.log('✅ Version check result:', result);
		return result;
	} catch (error) {
		console.error('❌ Version check failed:', error);
		return {
			isUpdateRequired: false,
			isForceUpdate: false,
			messages: [],
		};
	}
};
