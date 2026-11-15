/**
 * sanction/appeal.ts 통합 테스트
 * 이의 신청이 본인·1회·기한 조건을 지키는지 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

const { db, Timestamp } = createTestApp('sanction-appeal-integration-test');

jest.mock('../../src/utils/common', () => ({
	db,
	truncateText: (text: string) => text,
}));

jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: jest.fn(),
}));

import { sendPushNotification } from '../../src/utils/pushNotification';
import { submitAppealHandler } from '../../src/sanction/appeal';

const USER_ID = 'appeal_test_user';
const ADMIN_ID = 'appeal_test_admin';
const SANCTION_ID = 'appeal_test_sanction';
const DAY_MS = 24 * 60 * 60 * 1000;

const baseSanction = {
	userId: USER_ID,
	kind: 'warning',
	violationType: 'spam',
	reportIds: [],
	adminId: ADMIN_ID,
	status: 'active',
	reviewStage: 'awaitingUser',
	suspendUntil: null,
};

async function cleanupTestData() {
	await Promise.all([db.doc(`Sanctions/${SANCTION_ID}`).delete(), db.doc(`Users/${ADMIN_ID}`).delete()]);
}

describe('이의 신청', () => {
	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('본인 조치에 기한 안이면 검토 중으로 접수하고 관리자에게 푸시를 보낸다', async () => {
		await db.doc(`Users/${ADMIN_ID}`).set({ role: 'admin', pushToken: 'ExponentPushToken[admin]' });
		await db.doc(`Sanctions/${SANCTION_ID}`).set({ ...baseSanction, createdAt: Timestamp.now() });

		await submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '  규칙을 몰랐습니다.  ' });

		const appeal = (await db.doc(`Sanctions/${SANCTION_ID}`).get()).data()?.appeal;
		expect(appeal).toMatchObject({ content: '규칙을 몰랐습니다.', status: 'pending' });
		expect(appeal.createdAt).toBeDefined();
		expect((await db.doc(`Sanctions/${SANCTION_ID}`).get()).data()?.reviewStage).toBe('awaitingReply');
		expect(sendPushNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'ExponentPushToken[admin]',
				title: '[관리자] 이의 신청 접수',
				data: { url: `animal-crossing-trading-app://admin/appeal/${SANCTION_ID}` },
			}),
		);
	});

	it('처리 완료 단계의 조치도 이의 신청이 오면 답변 필요로 돌아간다', async () => {
		await db.doc(`Sanctions/${SANCTION_ID}`).set({
			...baseSanction,
			kind: 'permanent',
			reviewStage: 'done',
			createdAt: Timestamp.now(),
		});

		await submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '다시 검토해 주세요.' });

		expect((await db.doc(`Sanctions/${SANCTION_ID}`).get()).data()?.reviewStage).toBe('awaitingReply');
	});

	it('같은 조치에 두 번째 신청은 거부한다', async () => {
		await db.doc(`Sanctions/${SANCTION_ID}`).set({ ...baseSanction, createdAt: Timestamp.now() });

		await submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '첫 번째' });
		await expect(
			submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '두 번째' }),
		).rejects.toMatchObject({ code: 'already-exists' });

		const appeal = (await db.doc(`Sanctions/${SANCTION_ID}`).get()).data()?.appeal;
		expect(appeal.content).toBe('첫 번째');
	});

	it('경고는 조치일로부터 30일이 지나면 거부한다', async () => {
		await db.doc(`Sanctions/${SANCTION_ID}`).set({
			...baseSanction,
			createdAt: Timestamp.fromMillis(Date.now() - 31 * DAY_MS),
		});

		await expect(
			submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '늦은 신청' }),
		).rejects.toMatchObject({ code: 'failed-precondition' });
	});

	it('기간 정지는 해제일이 지나면 거부하고, 해제일 전이면 받는다', async () => {
		await db.doc(`Sanctions/${SANCTION_ID}`).set({
			...baseSanction,
			kind: 'days7',
			createdAt: Timestamp.fromMillis(Date.now() - 8 * DAY_MS),
			suspendUntil: Timestamp.fromMillis(Date.now() - DAY_MS),
		});
		await expect(
			submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '늦은 신청' }),
		).rejects.toMatchObject({ code: 'failed-precondition' });

		await db.doc(`Sanctions/${SANCTION_ID}`).update({ suspendUntil: Timestamp.fromMillis(Date.now() + DAY_MS) });
		await expect(
			submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '기한 안 신청' }),
		).resolves.toBeUndefined();
	});

	it('다른 유저의 조치, 취소된 조치, 잘못된 내용은 거부한다', async () => {
		await db.doc(`Sanctions/${SANCTION_ID}`).set({ ...baseSanction, createdAt: Timestamp.now() });

		await expect(submitAppealHandler(undefined, { sanctionId: SANCTION_ID, content: '내용' })).rejects.toMatchObject({
			code: 'unauthenticated',
		});
		await expect(submitAppealHandler('someone', { sanctionId: SANCTION_ID, content: '내용' })).rejects.toMatchObject({
			code: 'not-found',
		});
		await expect(submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '   ' })).rejects.toMatchObject({
			code: 'invalid-argument',
		});
		await expect(
			submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: 'a'.repeat(1001) }),
		).rejects.toMatchObject({ code: 'invalid-argument' });

		await db.doc(`Sanctions/${SANCTION_ID}`).update({ status: 'canceled' });
		await expect(submitAppealHandler(USER_ID, { sanctionId: SANCTION_ID, content: '내용' })).rejects.toMatchObject({
			code: 'failed-precondition',
		});
	});
});
