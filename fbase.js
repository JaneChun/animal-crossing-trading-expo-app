import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { liteClient } from 'algoliasearch/lite';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
// export const auth = getAuth(app);
export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export const searchClient = liteClient(
	process.env.EXPO_PUBLIC_ALGOLIA_APP_ID,
	process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY,
);
