/**
 * Firebase Emulator 통합 테스트 헬퍼
 * 에뮬레이터 연결 및 테스트 데이터 관리
 */

import { initializeApp, deleteApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// 에뮬레이터 호스트 설정
const FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
const PROJECT_ID = 'animal-crossing-trade-expo-app';

/**
 * 에뮬레이터 환경 설정
 * 테스트 실행 전 호출 필요
 */
export function setupEmulator(): void {
	process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
}

/**
 * 테스트용 Firebase 앱 인스턴스 생성
 * @param name - 앱 인스턴스 이름 (고유해야 함)
 * @returns Firebase 앱 인스턴스와 Firestore 인스턴스
 */
export function createTestApp(name: string): { app: App; db: Firestore; Timestamp: typeof Timestamp; FieldValue: typeof FieldValue } {
	// 에뮬레이터 환경 설정
	setupEmulator();

	// 동일 이름의 앱이 있으면 재사용
	const existingApps = getApps();
	const existingApp = existingApps.find((a) => a.name === name);

	if (existingApp) {
		return {
			app: existingApp,
			db: getFirestore(existingApp),
			Timestamp,
			FieldValue,
		};
	}

	const app = initializeApp({ projectId: PROJECT_ID }, name);
	const db = getFirestore(app);

	return { app, db, Timestamp, FieldValue };
}

/**
 * 테스트 앱 정리
 * @param app - 정리할 Firebase 앱 인스턴스
 */
export async function cleanupTestApp(app: App): Promise<void> {
	try {
		await deleteApp(app);
	} catch (error) {
		// 이미 삭제된 경우 무시
		console.warn('App already deleted or cleanup failed:', error);
	}
}

/**
 * 컬렉션의 모든 문서 삭제
 * @param db - Firestore 인스턴스
 * @param collectionPath - 삭제할 컬렉션 경로
 */
export async function cleanupCollection(
	db: Firestore,
	collectionPath: string,
): Promise<void> {
	const snapshot = await db.collection(collectionPath).get();

	if (snapshot.empty) {
		return;
	}

	const batch = db.batch();
	snapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});

	await batch.commit();
}

/**
 * 특정 문서들 삭제
 * @param db - Firestore 인스턴스
 * @param documentPaths - 삭제할 문서 경로 배열
 */
export async function cleanupDocuments(
	db: Firestore,
	documentPaths: string[],
): Promise<void> {
	const deletePromises = documentPaths.map((path) => db.doc(path).delete());

	await Promise.all(deletePromises);
}

/**
 * 테스트 컬렉션/문서 cleanup 유틸리티
 * @param db - Firestore 인스턴스
 * @param collections - 컬렉션 이름 배열
 * @param documentIds - 문서 ID 배열
 */
export async function cleanupTestData(
	db: Firestore,
	collections: string[],
	documentIds: string[],
): Promise<void> {
	const deletePromises = collections.flatMap((collection) =>
		documentIds.map((id) =>
			db
				.collection(collection)
				.doc(id)
				.delete()
				.catch(() => {
					// 문서가 없어도 무시
				}),
		),
	);

	await Promise.all(deletePromises);
}

/**
 * 테스트 데이터 초기화
 * @param db - Firestore 인스턴스
 * @param collection - 컬렉션 이름
 * @param docId - 문서 ID
 * @param data - 초기 데이터
 */
export async function setupTestDocument<T extends object>(
	db: Firestore,
	collection: string,
	docId: string,
	data: T,
): Promise<void> {
	await db.collection(collection).doc(docId).set(data);
}

/**
 * 테스트 문서 조회
 * @param db - Firestore 인스턴스
 * @param collection - 컬렉션 이름
 * @param docId - 문서 ID
 * @returns 문서 데이터
 */
export async function getTestDocument<T>(
	db: Firestore,
	collection: string,
	docId: string,
): Promise<T | undefined> {
	const doc = await db.collection(collection).doc(docId).get();
	return doc.exists ? (doc.data() as T) : undefined;
}
