import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { liteClient } from 'algoliasearch/lite';
import { initializeApp } from 'firebase/app';
import {
	connectAuthEmulator,
	getReactNativePersistence,
	initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_APP_ID,
	measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Firebase Emulator 연결 (개발 환경)
const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

if (USE_EMULATOR && __DEV__) {
	// 에뮬레이터 연결은 한 번만 실행되어야 함
	let isEmulatorConnected = false;

	if (!isEmulatorConnected) {
		console.log('🔧 Firebase Emulator 연결 중...');

		// 환경 변수에서 호스트 정보 가져오기
		const authHost =
			process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
		const firestoreHost =
			process.env.EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST ||
			'localhost:8080';
		const functionsHost =
			process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST ||
			'localhost:5001';
		const storageHost =
			process.env.EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST ||
			'localhost:9199';

		connectAuthEmulator(auth, `http://${authHost}`);

		const [firestoreHostname, firestorePort] = firestoreHost.split(':');
		connectFirestoreEmulator(db, firestoreHostname, parseInt(firestorePort));

		const [functionsHostname, functionsPort] = functionsHost.split(':');
		connectFunctionsEmulator(
			functions,
			functionsHostname,
			parseInt(functionsPort),
		);

		const [storageHostname, storagePort] = storageHost.split(':');
		connectStorageEmulator(storage, storageHostname, parseInt(storagePort));

		console.log('✅ Firebase Emulator 연결 완료');

		isEmulatorConnected = true;
	}
}

export const searchClient = liteClient(
	process.env.EXPO_PUBLIC_ALGOLIA_APP_ID,
	process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY,
);
