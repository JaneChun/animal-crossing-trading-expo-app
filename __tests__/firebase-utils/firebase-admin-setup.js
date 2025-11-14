const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

let isInitialized = false;

// Firebase Admin SDK 초기화 (에뮬레이터용)
function initializeFirebaseAdmin() {
	if (isInitialized) {
		return {
			auth: getAuth(),
			db: getFirestore(),
		};
	}

	try {
		initializeApp({
			projectId: 'animal-crossing-trade-expo-app',
		});

		isInitialized = true;
		console.log('✅ Firebase Admin SDK 초기화 완료');

		return {
			auth: getAuth(),
			db: getFirestore(),
		};
	} catch (error) {
		console.error('❌ Firebase Admin SDK 초기화 실패:', error.message);
		throw error;
	}
}

// 자동 초기화
const { auth, db } = initializeFirebaseAdmin();

module.exports = {
	initializeFirebaseAdmin,
	auth,
	db,
};
