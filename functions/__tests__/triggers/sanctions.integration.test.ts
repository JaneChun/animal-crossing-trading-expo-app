/**
 * triggers/sanctions.ts, schedulers/expireUnacknowledgedWarningsScheduler.ts 통합 테스트
 * 경고 확인과 확인 기한 만료가 관리자 처리 단계를 '처리 완료'로 옮기는지 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

const { db, Timestamp } = createTestApp('sanctions-trigger-integration-test');

jest.mock('../../src/utils/common', () => ({
	db,
	truncateText: (text: string) => text,
}));

jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: jest.fn(),
}));

import { handleSanctionUpdated } from '../../src/triggers/sanctions';
import { expireUnacknowledgedWarnings } from '../../src/schedulers/expireUnacknowledgedWarningsScheduler';
import { SanctionDoc } from '../../src/types/sanction';

const USER_ID = 'sanctions_trigger_user';
const DAY_MS = 24 * 60 * 60 * 1000;

const baseSanction = {
	userId: USER_ID,
	kind: 'warning',
	violationType: 'spam',
	reportIds: [],
	adminId: 'sanctions_trigger_admin',
	status: 'active',
	reviewStage: 'awaitingUser',
	suspendUntil: null,
};

async function cleanupTestData() {
	const sanctions = await db.collection('Sanctions').where('userId', '==', USER_ID).get();
	await Promise.all(sanctions.docs.map((doc) => doc.ref.delete()));
}

async function addSanction(sanctionId: string, fields: Record<string, unknown> = {}) {
	const ref = db.doc(`Sanctions/${sanctionId}`);
	await ref.set({ ...baseSanction, createdAt: Timestamp.now(), ...fields });
	return ref;
}

async function getReviewStage(sanctionId: string) {
	return (await db.doc(`Sanctions/${sanctionId}`).get()).data()?.reviewStage;
}

describe('경고 확인 트리거', () => {
	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('유저 확인 대기 경고를 확인하면 처리 완료로 옮긴다', async () => {
		const ref = await addSanction('ack_warning');
		const before = (await ref.get()).data() as SanctionDoc;
		await ref.update({ acknowledgedAt: Timestamp.now() });
		const after = (await ref.get()).data() as SanctionDoc;

		await handleSanctionUpdated(ref, before, after);

		expect(await getReviewStage('ack_warning')).toBe('done');
	});

	it('확인과 함께 이의 신청이 들어와 답변 필요가 되었으면 그대로 둔다', async () => {
		const ref = await addSanction('ack_with_appeal');
		const before = (await ref.get()).data() as SanctionDoc;
		await ref.update({ acknowledgedAt: Timestamp.now() });
		const after = (await ref.get()).data() as SanctionDoc;
		await ref.update({ reviewStage: 'awaitingReply' });

		await handleSanctionUpdated(ref, before, after);

		expect(await getReviewStage('ack_with_appeal')).toBe('awaitingReply');
	});

	it('확인 시각이 새로 생기지 않은 변경에는 반응하지 않는다', async () => {
		const ref = await addSanction('no_ack');
		const before = (await ref.get()).data() as SanctionDoc;
		await ref.update({ status: 'canceled' });
		const after = (await ref.get()).data() as SanctionDoc;

		await handleSanctionUpdated(ref, before, after);

		expect(await getReviewStage('no_ack')).toBe('awaitingUser');
	});
});

describe('경고 확인 기한 만료 스케줄러', () => {
	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('조치일 + 30일이 지난 유저 확인 대기 경고만 처리 완료로 옮긴다', async () => {
		await Promise.all([
			addSanction('expired_warning', { createdAt: Timestamp.fromMillis(Date.now() - 31 * DAY_MS) }),
			addSanction('fresh_warning', { createdAt: Timestamp.fromMillis(Date.now() - 29 * DAY_MS) }),
			addSanction('expired_replying', {
				reviewStage: 'awaitingReply',
				createdAt: Timestamp.fromMillis(Date.now() - 31 * DAY_MS),
			}),
		]);

		await expireUnacknowledgedWarnings(new Date());

		expect(await getReviewStage('expired_warning')).toBe('done');
		expect(await getReviewStage('fresh_warning')).toBe('awaitingUser');
		expect(await getReviewStage('expired_replying')).toBe('awaitingReply');
	});
});
