/**
 * blocking.ts 모듈 통합 테스트
 *
 * Firebase 에뮬레이터를 사용하여 실제 차단 시스템 전체 플로우를 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

// 테스트용 Firebase 앱 인스턴스 생성 - 공통 헬퍼 활용
const { db, Timestamp } = createTestApp('blocking-integration-test');

// common.ts Mock - blocking.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	db,
}));

import {
	handleUserBlocked,
	handleUserUnblocked,
} from '../../src/triggers/blocking';

describe('사용자 차단 처리 통합 테스트', () => {
	const userId = 'test_user_123';
	const blockedUserId = 'blocked_user_456';
	const mockTimestamp = Timestamp.now();

	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('handleUserBlocked 함수', () => {
		describe('성공 케이스', () => {
			it('사용자 차단 시 BlockedBy 서브컬렉션에 차단 관계가 생성되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. handleUserBlocked 함수 호출
				 * 2. 차단당한 사용자의 BlockedBy 서브컬렉션에 차단 정보 저장 확인
				 * 3. 저장된 데이터 내용 검증
				 */
				await handleUserBlocked(userId, blockedUserId, mockTimestamp);

				// 차단 관계가 올바르게 생성되었는지 확인
				const blockedByDoc = await db
					.collection('Users')
					.doc(blockedUserId)
					.collection('BlockedBy')
					.doc(userId)
					.get();

				expect(blockedByDoc.exists).toBe(true);

				const blockedByData = blockedByDoc.data();
				expect(blockedByData).toEqual({
					id: userId,
					blockedAt: mockTimestamp,
				});
			});

			it('여러 사용자가 동일한 사용자를 차단할 때 각각 독립적으로 저장되어야 한다', async () => {
				const user1 = 'user_1';
				const user2 = 'user_2';
				const targetUser = 'target_user';
				const timestamp1 = Timestamp.now();
				const timestamp2 = Timestamp.fromDate(new Date(Date.now() + 1000));

				// 두 사용자가 동일한 대상을 차단
				await Promise.all([
					handleUserBlocked(user1, targetUser, timestamp1),
					handleUserBlocked(user2, targetUser, timestamp2),
				]);

				// 각각의 차단 관계가 독립적으로 저장되었는지 확인
				const [blocked1Doc, blocked2Doc] = await Promise.all([
					db
						.collection('Users')
						.doc(targetUser)
						.collection('BlockedBy')
						.doc(user1)
						.get(),
					db
						.collection('Users')
						.doc(targetUser)
						.collection('BlockedBy')
						.doc(user2)
						.get(),
				]);

				expect(blocked1Doc.exists).toBe(true);
				expect(blocked2Doc.exists).toBe(true);

				expect(blocked1Doc.data()).toEqual({
					id: user1,
					blockedAt: timestamp1,
				});

				expect(blocked2Doc.data()).toEqual({
					id: user2,
					blockedAt: timestamp2,
				});
			});

			it('기존 차단 관계가 있어도 merge 옵션으로 덮어써야 한다', async () => {
				const firstTimestamp = Timestamp.now();
				const secondTimestamp = Timestamp.fromDate(new Date(Date.now() + 5000));

				// 첫 번째 차단
				await handleUserBlocked(userId, blockedUserId, firstTimestamp);

				// 두 번째 차단 (시간만 다름)
				await handleUserBlocked(userId, blockedUserId, secondTimestamp);

				// 최신 데이터로 덮어써졌는지 확인
				const blockedByDoc = await db
					.collection('Users')
					.doc(blockedUserId)
					.collection('BlockedBy')
					.doc(userId)
					.get();

				expect(blockedByDoc.exists).toBe(true);
				expect(blockedByDoc.data()).toEqual({
					id: userId,
					blockedAt: secondTimestamp,
				});
			});
		});

		describe('에러 시나리오', () => {
			it('잘못된 사용자 ID로 차단 시도 시 에러 없이 완료되어야 한다', async () => {
				/**
				 * Firestore는 존재하지 않는 문서에 대한 set 작업도 허용하므로
				 * 실제로는 에러가 발생하지 않음. 대신 로그만 확인
				 */
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				await expect(
					handleUserBlocked('', blockedUserId, mockTimestamp),
				).resolves.not.toThrow();

				await expect(
					handleUserBlocked(userId, '', mockTimestamp),
				).resolves.not.toThrow();

				consoleErrorSpy.mockRestore();
			});
		});
	});

	describe('handleUserUnblocked 함수', () => {
		beforeEach(async () => {
			// 각 테스트 전에 차단 관계 생성
			await handleUserBlocked(userId, blockedUserId, mockTimestamp);
		});

		describe('성공 케이스', () => {
			it('사용자 차단 해제 시 BlockedBy 서브컬렉션에서 차단 관계가 삭제되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 사전에 차단 관계가 존재하는 상태
				 * 2. handleUserUnblocked 함수 호출
				 * 3. 차단 관계가 삭제되었는지 확인
				 */
				// 차단 관계가 존재하는지 사전 확인
				let blockedByDoc = await db
					.collection('Users')
					.doc(blockedUserId)
					.collection('BlockedBy')
					.doc(userId)
					.get();

				expect(blockedByDoc.exists).toBe(true);

				// 차단 해제 실행
				await handleUserUnblocked(userId, blockedUserId);

				// 차단 관계가 삭제되었는지 확인
				blockedByDoc = await db
					.collection('Users')
					.doc(blockedUserId)
					.collection('BlockedBy')
					.doc(userId)
					.get();

				expect(blockedByDoc.exists).toBe(false);
			});

			it('여러 차단 관계 중 특정 관계만 삭제되어야 한다', async () => {
				const user1 = 'user_1';
				const user2 = 'user_2';
				const targetUser = 'target_user';
				const timestamp1 = Timestamp.now();
				const timestamp2 = Timestamp.fromDate(new Date(Date.now() + 1000));

				// 두 사용자가 동일한 대상을 차단
				await Promise.all([
					handleUserBlocked(user1, targetUser, timestamp1),
					handleUserBlocked(user2, targetUser, timestamp2),
				]);

				// user1의 차단만 해제
				await handleUserUnblocked(user1, targetUser);

				// user1의 차단은 삭제되고 user2의 차단은 유지되어야 함
				const [blocked1Doc, blocked2Doc] = await Promise.all([
					db
						.collection('Users')
						.doc(targetUser)
						.collection('BlockedBy')
						.doc(user1)
						.get(),
					db
						.collection('Users')
						.doc(targetUser)
						.collection('BlockedBy')
						.doc(user2)
						.get(),
				]);

				expect(blocked1Doc.exists).toBe(false);
				expect(blocked2Doc.exists).toBe(true);
				expect(blocked2Doc.data()).toEqual({
					id: user2,
					blockedAt: timestamp2,
				});
			});

			it('존재하지 않는 차단 관계 해제 시도 시 에러 없이 완료되어야 한다', async () => {
				/**
				 * Firestore는 존재하지 않는 문서에 대한 delete 작업도 허용하므로
				 * 실제로는 에러가 발생하지 않음
				 */
				const nonExistentUserId = 'non_existent_user';

				await expect(
					handleUserUnblocked(nonExistentUserId, blockedUserId),
				).resolves.not.toThrow();

				await expect(
					handleUserUnblocked(userId, 'non_existent_blocked_user'),
				).resolves.not.toThrow();
			});
		});
	});

	describe('통합 시나리오', () => {
		it('차단 -> 차단 해제 -> 재차단 플로우가 정상적으로 동작해야 한다', async () => {
			const firstTimestamp = Timestamp.now();
			const secondTimestamp = Timestamp.fromDate(new Date(Date.now() + 5000));

			// 1. 차단
			await handleUserBlocked(userId, blockedUserId, firstTimestamp);

			let blockedByDoc = await db
				.collection('Users')
				.doc(blockedUserId)
				.collection('BlockedBy')
				.doc(userId)
				.get();

			expect(blockedByDoc.exists).toBe(true);
			expect(blockedByDoc.data()).toEqual({
				id: userId,
				blockedAt: firstTimestamp,
			});

			// 2. 차단 해제
			await handleUserUnblocked(userId, blockedUserId);

			blockedByDoc = await db
				.collection('Users')
				.doc(blockedUserId)
				.collection('BlockedBy')
				.doc(userId)
				.get();

			expect(blockedByDoc.exists).toBe(false);

			// 3. 재차단
			await handleUserBlocked(userId, blockedUserId, secondTimestamp);

			blockedByDoc = await db
				.collection('Users')
				.doc(blockedUserId)
				.collection('BlockedBy')
				.doc(userId)
				.get();

			expect(blockedByDoc.exists).toBe(true);
			expect(blockedByDoc.data()).toEqual({
				id: userId,
				blockedAt: secondTimestamp,
			});
		});

		it('다수의 사용자 간 복잡한 차단 관계가 정상적으로 관리되어야 한다', async () => {
			const users = ['user_A', 'user_B', 'user_C'];
			const timestamp = Timestamp.now();

			// A가 B, C를 차단
			await Promise.all([
				handleUserBlocked(users[0], users[1], timestamp),
				handleUserBlocked(users[0], users[2], timestamp),
			]);

			// B가 A를 차단
			await handleUserBlocked(users[1], users[0], timestamp);

			// 각 사용자의 BlockedBy 서브컬렉션 확인
			const [aBlockedBy, bBlockedBy, cBlockedBy] = await Promise.all([
				db.collection('Users').doc(users[0]).collection('BlockedBy').get(),
				db.collection('Users').doc(users[1]).collection('BlockedBy').get(),
				db.collection('Users').doc(users[2]).collection('BlockedBy').get(),
			]);

			// A는 B에 의해 차단됨
			expect(aBlockedBy.size).toBe(1);
			expect(aBlockedBy.docs[0].id).toBe(users[1]);

			// B는 A에 의해 차단됨
			expect(bBlockedBy.size).toBe(1);
			expect(bBlockedBy.docs[0].id).toBe(users[0]);

			// C는 A에 의해 차단됨
			expect(cBlockedBy.size).toBe(1);
			expect(cBlockedBy.docs[0].id).toBe(users[0]);
		});
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	async function cleanupTestData() {
		const testUserIds = [
			userId,
			blockedUserId,
			'user_1',
			'user_2',
			'target_user',
			'user_A',
			'user_B',
			'user_C',
			'non_existent_user',
			'non_existent_blocked_user',
		];

		const deletePromises = testUserIds.map(async (uid) => {
			// 각 사용자의 BlockedBy 서브컬렉션 삭제
			const blockedByCollection = db
				.collection('Users')
				.doc(uid)
				.collection('BlockedBy');

			const blockedBySnap = await blockedByCollection.get();
			const deletePromises = blockedBySnap.docs.map((doc) => doc.ref.delete());
			await Promise.all(deletePromises);

			// 사용자 문서 삭제
			await db.collection('Users').doc(uid).delete();
		});

		await Promise.all(deletePromises);
	}
});
