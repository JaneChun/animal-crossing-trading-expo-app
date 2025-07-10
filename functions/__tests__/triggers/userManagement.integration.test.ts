/**
 * userManagement.ts 모듈 통합 테스트
 *
 * Auth 에뮬레이터 없이는 완전한 테스트가 어려우므로
 * Firestore 로직과 에러 처리에 집중한 제한적 통합 테스트
 */

// 에뮬레이터 연결 설정
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

// 테스트용 Firebase 앱 인스턴스 생성
const testApp = initializeApp(
	{
		projectId: 'animal-crossing-trade-expo-app',
	},
	'usermanagement-integration-test',
);

const db = getFirestore(testApp);

// common.ts Mock - userManagement.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	auth: {
		deleteUser: jest.fn().mockResolvedValue(undefined),
	},
	db,
}));

import { deleteUserAndArchive } from '../../src/triggers/userManagement';

describe('사용자 삭제 및 아카이브 통합 테스트 (제한적)', () => {
	let testUserId: string;
	let testUserEmail: string;

	beforeEach(async () => {
		await cleanupTestData();

		// 테스트용 사용자 ID 생성
		testUserId = `test-user-${Date.now()}`;
		testUserEmail = `test-${Date.now()}@example.com`;

		// Firestore에 사용자 데이터 생성
		await db.collection('Users').doc(testUserId).set({
			email: testUserEmail,
			displayName: '테스트 사용자',
			createdAt: Timestamp.now(),
			photoURL: 'https://example.com/profile.jpg',
		});
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('deleteUserAndArchive 함수', () => {
		describe('성공 케이스 (Auth Mock 사용)', () => {
			it('사용자 삭제 시 Firestore에서 아카이브되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. Firestore에 사용자 존재
				 * 2. deleteUserAndArchive 호출
				 * 3. Auth는 Mock으로 성공
				 * 4. Users 컬렉션에서 삭제 확인
				 * 5. DeletedUsers 컬렉션에 아카이브 확인
				 */
				// 삭제 전 상태 확인
				const userDocBefore = await db
					.collection('Users')
					.doc(testUserId)
					.get();
				expect(userDocBefore.exists).toBe(true);

				// 사용자 삭제 실행
				const result = await deleteUserAndArchive(testUserId);

				// 결과 메시지 확인
				expect(result.message).toBe('유저 삭제에 성공했습니다.');

				// Users 컬렉션에서 삭제되었는지 확인
				const userDocAfter = await db.collection('Users').doc(testUserId).get();
				expect(userDocAfter.exists).toBe(false);

				// DeletedUsers 컬렉션에 아카이브되었는지 확인
				const deletedUserDoc = await db
					.collection('DeletedUsers')
					.doc(testUserId)
					.get();
				expect(deletedUserDoc.exists).toBe(true);

				const deletedUserData = deletedUserDoc.data();
				expect(deletedUserData?.email).toBe(testUserEmail);
				expect(deletedUserData?.displayName).toBe('테스트 사용자');
				expect(deletedUserData?.deletedAt).toBeInstanceOf(Timestamp);

				// 원본 데이터가 모두 포함되어 있는지 확인
				expect(deletedUserData?.photoURL).toBe(
					'https://example.com/profile.jpg',
				);
			});
		});

		describe('에러 케이스', () => {
			it('uid가 빈 문자열이면 invalid-argument 에러를 throw해야 한다', async () => {
				await expect(deleteUserAndArchive('')).rejects.toThrow(
					functions.https.HttpsError,
				);

				await expect(deleteUserAndArchive('')).rejects.toMatchObject({
					code: 'invalid-argument',
					message: 'uid 파라미터가 누락되었습니다.',
				});
			});

			it('uid가 undefined면 invalid-argument 에러를 throw해야 한다', async () => {
				await expect(deleteUserAndArchive(undefined as any)).rejects.toThrow(
					functions.https.HttpsError,
				);

				await expect(
					deleteUserAndArchive(undefined as any),
				).rejects.toMatchObject({
					code: 'invalid-argument',
					message: 'uid 파라미터가 누락되었습니다.',
				});
			});

			it('Firestore에 없는 사용자는 not-found 에러를 throw해야 한다', async () => {
				const nonExistentUid = 'non-existent-uid-12345';

				await expect(deleteUserAndArchive(nonExistentUid)).rejects.toThrow(
					functions.https.HttpsError,
				);

				await expect(
					deleteUserAndArchive(nonExistentUid),
				).rejects.toMatchObject({
					code: 'not-found',
					message: '존재하지 않는 유저입니다.',
				});
			});
		});

		describe('배치 작업 검증', () => {
			it('Firestore 배치 작업이 원자적으로 실행되어야 한다', async () => {
				/**
				 * 배치 작업의 원자성을 완전히 테스트하기는 어렵지만,
				 * 정상적인 경우에 모든 작업이 완료되는지 확인
				 */
				await deleteUserAndArchive(testUserId);

				// 모든 작업이 완료되었는지 확인
				const [userDoc, deletedUserDoc] = await Promise.all([
					db.collection('Users').doc(testUserId).get(),
					db.collection('DeletedUsers').doc(testUserId).get(),
				]);

				expect(userDoc.exists).toBe(false);
				expect(deletedUserDoc.exists).toBe(true);
			});

			it('여러 사용자를 동시에 삭제해도 각각 독립적으로 처리되어야 한다', async () => {
				// 추가 사용자 생성
				const user2Id = `test-user-2-${Date.now()}`;
				const user2Email = `test2-${Date.now()}@example.com`;

				await db.collection('Users').doc(user2Id).set({
					email: user2Email,
					displayName: '테스트 사용자 2',
					createdAt: Timestamp.now(),
				});

				// 두 사용자 동시 삭제
				const [result1, result2] = await Promise.all([
					deleteUserAndArchive(testUserId),
					deleteUserAndArchive(user2Id),
				]);

				expect(result1.message).toBe('유저 삭제에 성공했습니다.');
				expect(result2.message).toBe('유저 삭제에 성공했습니다.');

				// 두 사용자 모두 아카이브되었는지 확인
				const [deleted1Doc, deleted2Doc] = await Promise.all([
					db.collection('DeletedUsers').doc(testUserId).get(),
					db.collection('DeletedUsers').doc(user2Id).get(),
				]);

				expect(deleted1Doc.exists).toBe(true);
				expect(deleted2Doc.exists).toBe(true);
				expect(deleted1Doc.data()?.email).toBe(testUserEmail);
				expect(deleted2Doc.data()?.email).toBe(user2Email);
			});
		});
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	async function cleanupTestData() {
		try {
			// Firestore에서 테스트 데이터 삭제
			const [usersSnap, deletedUsersSnap] = await Promise.all([
				db.collection('Users').get(),
				db.collection('DeletedUsers').get(),
			]);

			const firestoreDeletePromises = [
				...usersSnap.docs.map((doc) => doc.ref.delete()),
				...deletedUsersSnap.docs.map((doc) => doc.ref.delete()),
			];

			await Promise.all(firestoreDeletePromises);
		} catch (error) {
			// 클린업 에러는 무시
			console.warn('Cleanup error (ignored):', error);
		}
	}
});
