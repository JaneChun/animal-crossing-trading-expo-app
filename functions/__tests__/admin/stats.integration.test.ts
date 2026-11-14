/**
 * admin/stats.ts 통합 테스트
 * 관리자 통계 집계를 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

const { db, Timestamp } = createTestApp('admin-stats-integration-test');

jest.mock('../../src/utils/common', () => ({
	db,
}));

import {
	assertAdmin,
	getDailyStatsHandler,
	getKstDayRange,
	getUserStatsHandler,
} from '../../src/admin/stats';

// 다른 테스트 데이터와 겹치지 않도록 먼 과거 날짜와 고유 uid를 쓴다
const STATS_DATE = '2001-02-03';
const KST_MIDNIGHT_MS = Date.UTC(2001, 1, 3) - 9 * 60 * 60 * 1000;
const TARGET_UID = 'stats_test_user';
const ADMIN_UID = 'stats_test_admin';

const createdDocPaths: string[] = [];

async function setDoc(path: string, data: Record<string, unknown>) {
	createdDocPaths.push(path);
	await db.doc(path).set(data);
}

async function cleanupTestData() {
	await Promise.all(createdDocPaths.map((path) => db.doc(path).delete()));
	createdDocPaths.length = 0;
}

describe('관리자 통계', () => {
	afterEach(async () => {
		await cleanupTestData();
	});

	describe('getKstDayRange', () => {
		it('KST 0시부터 다음 날 KST 0시 전까지를 범위로 한다', () => {
			const { start, end } = getKstDayRange(STATS_DATE);

			expect(start.toMillis()).toBe(KST_MIDNIGHT_MS);
			expect(end.toMillis()).toBe(KST_MIDNIGHT_MS + 24 * 60 * 60 * 1000);
		});

		it('형식이 다르면 invalid-argument를 던진다', () => {
			expect(() => getKstDayRange('2001-2-3')).toThrow(
				expect.objectContaining({ code: 'invalid-argument' }),
			);
		});
	});

	describe('getDailyStatsHandler', () => {
		it('그날 KST 범위 안에 생성된 문서만 종류별로 센다', async () => {
			const inside = Timestamp.fromMillis(KST_MIDNIGHT_MS + 60 * 1000);
			const before = Timestamp.fromMillis(KST_MIDNIGHT_MS - 1);
			const nextDay = Timestamp.fromMillis(KST_MIDNIGHT_MS + 24 * 60 * 60 * 1000);

			await setDoc('Boards/stats_post_1', { createdAt: inside, status: 'hidden' });
			await setDoc('Communities/stats_post_2', { createdAt: inside });
			await setDoc('Boards/stats_post_before', { createdAt: before });
			await setDoc('Boards/stats_post_1/Comments/c1', { createdAt: inside });
			await setDoc('Boards/stats_post_1/Comments/c1/Replies/r1', { createdAt: inside });
			await setDoc('Boards/stats_post_1/Comments/c1/Replies/r2', { createdAt: inside });
			await setDoc('Chats/stats_chat/Messages/m1', { createdAt: inside });
			await setDoc('Chats/stats_chat/Messages/m2', { createdAt: nextDay });
			await setDoc('Users/stats_new_user', { createdAt: inside });
			await setDoc('Reviews/stats_review', { createdAt: inside });

			const stats = await getDailyStatsHandler(STATS_DATE);

			expect(stats).toEqual({
				date: STATS_DATE,
				posts: 2,
				comments: 1,
				replies: 2,
				messages: 1,
				signUps: 1,
				reviews: 1,
			});
		});
	});

	describe('getUserStatsHandler', () => {
		it('유저의 활동·신고·차단 수를 센다', async () => {
			await setDoc('Boards/stats_u_post', { creatorId: TARGET_UID });
			await setDoc('Communities/stats_u_post2', { creatorId: TARGET_UID });
			await setDoc('Boards/stats_u_post/Comments/c1', { creatorId: TARGET_UID });
			await setDoc('Boards/stats_u_post/Comments/c1/Replies/r1', { creatorId: TARGET_UID });
			await setDoc('Chats/stats_u_chat', { participants: [TARGET_UID, 'other'] });
			await setDoc('Chats/stats_u_chat/Messages/m1', { senderId: TARGET_UID });
			await setDoc('Chats/stats_u_chat/Messages/m2', { senderId: 'other' });
			await setDoc('Reports/stats_u_report', { reporterId: TARGET_UID });
			await setDoc(`Users/${TARGET_UID}/BlockedBy/other`, {});
			await setDoc(`Users/${TARGET_UID}/BlockedUsers/x`, {});
			await setDoc(`Users/${TARGET_UID}/BlockedUsers/y`, {});

			const stats = await getUserStatsHandler(TARGET_UID);

			expect(stats).toEqual({
				posts: 2,
				comments: 1,
				replies: 1,
				chatRooms: 1,
				messages: 1,
				reportsFiled: 1,
				blockedBy: 1,
				blocking: 2,
			});
		});
	});

	describe('assertAdmin', () => {
		it('role이 admin이면 통과한다', async () => {
			await setDoc(`Users/${ADMIN_UID}`, { role: 'admin' });

			await expect(assertAdmin(ADMIN_UID)).resolves.toBeUndefined();
		});

		it('role이 없으면 permission-denied를 던진다', async () => {
			await setDoc(`Users/${TARGET_UID}`, { displayName: '일반' });

			await expect(assertAdmin(TARGET_UID)).rejects.toMatchObject({
				code: 'permission-denied',
			});
		});

		it('로그인하지 않았으면 unauthenticated를 던진다', async () => {
			await expect(assertAdmin(undefined)).rejects.toMatchObject({ code: 'unauthenticated' });
		});
	});
});
