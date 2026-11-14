/**
 * notifications/report.ts 통합 테스트
 * 신고 접수 시 관리자 푸시와 채팅방 reportedAt 기록을 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';
import { createMockPushNotification, createMockTruncateText } from '../helpers';

const { db, Timestamp } = createTestApp('report-notification-integration-test');
const mockTruncateText = createMockTruncateText();

jest.mock('../../src/utils/common', () => ({
	db,
	truncateText: mockTruncateText,
}));

const { mockSendPushNotification } = createMockPushNotification();
jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: mockSendPushNotification,
}));

import {
	buildReportPushBody,
	handleReportWritten,
	isNewReportWrite,
} from '../../src/notifications/report';

const ADMIN_WITH_TOKEN = 'report_noti_admin_1';
const ADMIN_WITHOUT_TOKEN = 'report_noti_admin_2';
const NORMAL_USER = 'report_noti_user_1';
const CHAT_ID = 'report_noti_chat_1';
const MISSING_CHAT_ID = 'report_noti_chat_missing';

async function cleanupTestData() {
	await Promise.all(
		[ADMIN_WITH_TOKEN, ADMIN_WITHOUT_TOKEN, NORMAL_USER].map((uid) =>
			db.doc(`Users/${uid}`).delete(),
		),
	);
	await db.doc(`Chats/${CHAT_ID}`).delete();
	await db.doc(`Chats/${MISSING_CHAT_ID}`).delete();
}

describe('신고 접수 관리자 알림', () => {
	beforeEach(async () => {
		await cleanupTestData();
		mockSendPushNotification.mockReset();
		mockSendPushNotification.mockResolvedValue(undefined);
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('buildReportPushBody', () => {
		it('유형·대상 종류·상세 내용 앞 30자를 구분자로 잇는다', () => {
			const detail = '거래 후 아이템을 안 주고 차단했어요. 선입금했는데 연락이 안 됩니다.';

			const body = buildReportPushBody({
				reporterId: 'a',
				reporteeId: 'b',
				chatId: 'chat',
				category: 'fraud',
				detail,
			});

			expect(body).toBe(`사기 · 채팅 · ${detail.substring(0, 30)}...`);
		});

		it('상세 내용이 비어 있으면 마지막 구분자와 함께 생략한다', () => {
			const body = buildReportPushBody({
				reporterId: 'a',
				reporteeId: 'b',
				postId: 'post',
				commentId: 'comment',
				category: 'abuse',
				detail: '  ',
			});

			expect(body).toBe('욕설/비방 · 댓글');
		});

		it('게시글·채팅·댓글 id가 모두 없으면 프로필 신고로 표기한다', () => {
			const body = buildReportPushBody({
				reporterId: 'a',
				reporteeId: 'b',
				category: 'other',
			});

			expect(body).toBe('기타 · 프로필');
		});
	});

	describe('isNewReportWrite', () => {
		const base = { reporterId: 'a', reporteeId: 'b', category: 'spam' };

		it('생성이면 true', () => {
			expect(isNewReportWrite(undefined, { ...base, createdAt: Timestamp.now() })).toBe(true);
		});

		it('재신고로 createdAt이 바뀌면 true', () => {
			const before = { ...base, createdAt: Timestamp.fromMillis(1000) };
			const after = { ...base, createdAt: Timestamp.fromMillis(2000) };

			expect(isNewReportWrite(before, after)).toBe(true);
		});

		it('관리자가 resolved만 바꿔 createdAt이 같으면 false', () => {
			const createdAt = Timestamp.fromMillis(1000);

			expect(isNewReportWrite({ ...base, createdAt }, { ...base, createdAt })).toBe(false);
		});

		it('삭제면 false', () => {
			expect(isNewReportWrite({ ...base, createdAt: Timestamp.now() }, undefined)).toBe(
				false,
			);
		});
	});

	describe('handleReportWritten', () => {
		it('pushToken이 있는 관리자에게만 신고 상세 딥링크로 푸시를 보낸다', async () => {
			await db
				.doc(`Users/${ADMIN_WITH_TOKEN}`)
				.set({ role: 'admin', pushToken: 'ExponentPushToken[admin]' });
			await db.doc(`Users/${ADMIN_WITHOUT_TOKEN}`).set({ role: 'admin' });
			await db.doc(`Users/${NORMAL_USER}`).set({ pushToken: 'ExponentPushToken[user]' });

			await handleReportWritten('report_1', {
				reporterId: NORMAL_USER,
				reporteeId: 'someone',
				category: 'spam',
				detail: '도배',
			});

			expect(mockSendPushNotification).toHaveBeenCalledTimes(1);
			expect(mockSendPushNotification).toHaveBeenCalledWith({
				to: 'ExponentPushToken[admin]',
				title: '[관리자] 신고 접수',
				body: '광고/도배 · 프로필 · 도배',
				data: { url: 'animal-crossing-trading-app://admin/report/report_1' },
			});
		});

		it('채팅 신고면 채팅방 문서에 reportedAt을 기록한다', async () => {
			await db
				.doc(`Chats/${CHAT_ID}`)
				.set({ participants: ['a', 'b'], visibleTo: ['a', 'b'] });

			await handleReportWritten('report_2', {
				reporterId: 'a',
				reporteeId: 'b',
				chatId: CHAT_ID,
				category: 'fraud',
			});

			const chatSnap = await db.doc(`Chats/${CHAT_ID}`).get();
			expect(chatSnap.data()?.reportedAt).toBeInstanceOf(Timestamp);
		});

		it('채팅방 문서가 없으면 새로 만들지 않는다', async () => {
			await handleReportWritten('report_3', {
				reporterId: 'a',
				reporteeId: 'b',
				chatId: MISSING_CHAT_ID,
				category: 'fraud',
			});

			const chatSnap = await db.doc(`Chats/${MISSING_CHAT_ID}`).get();
			expect(chatSnap.exists).toBe(false);
		});
	});
});
