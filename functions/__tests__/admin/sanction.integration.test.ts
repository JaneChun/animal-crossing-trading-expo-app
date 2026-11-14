/**
 * admin/sanction.ts 통합 테스트
 * 관리자 경고·정지가 조치 기록, 대상 숨김, 정지 기간을 기대대로 남기는지 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

const { db, Timestamp } = createTestApp('admin-sanction-integration-test');

jest.mock('../../src/utils/common', () => ({
	db,
}));

jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: jest.fn(),
}));

import { sendPushNotification } from '../../src/utils/pushNotification';

import {
	buildSanctionPush,
	cancelSanctionHandler,
	decideAppealHandler,
	getRecommendedSanctionKind,
	getSanctionRecommendationHandler,
	issueSanctionHandler,
	PERMANENT_SUSPEND_UNTIL,
} from '../../src/admin/sanction';

const USER_ID = 'sanction_test_user';
const ADMIN_ID = 'sanction_test_admin';
const POST_PATH = 'Boards/sanction_test_post';
const OTHER_POST_PATH = 'Communities/sanction_test_other_post';
const COMMENT_PATH = `${POST_PATH}/Comments/sanction_test_comment`;
const REPLY_PATH = `${COMMENT_PATH}/Replies/sanction_test_reply`;

const DAY_MS = 24 * 60 * 60 * 1000;

async function cleanupTestData() {
	const sanctions = await db.collection('Sanctions').where('userId', '==', USER_ID).get();
	await Promise.all([
		...sanctions.docs.map((doc) => doc.ref.delete()),
		db.doc(REPLY_PATH).delete(),
		db.doc(COMMENT_PATH).delete(),
		db.doc(POST_PATH).delete(),
		db.doc(OTHER_POST_PATH).delete(),
		db.doc(`Users/${USER_ID}`).delete(),
	]);
}

async function getSanction(sanctionId: string) {
	return (await db.doc(`Sanctions/${sanctionId}`).get()).data();
}

describe('관리자 경고·정지', () => {
	beforeEach(async () => {
		await cleanupTestData();
		await db.doc(`Users/${USER_ID}`).set({
			displayName: '조치 대상',
			report: { total: 1, recent30Days: 1, suspendUntil: null },
		});
		await db.doc(POST_PATH).set({ creatorId: USER_ID, title: '위반 글', status: 'active', commentCount: 2 });
		await db.doc(OTHER_POST_PATH).set({ creatorId: USER_ID, title: '다른 글', status: 'active' });
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('경고는 조치 기록을 남기고 대상 글만 관리자 숨김 처리하며 정지하지 않는다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'externalTrade',
			reportIds: ['report_1'],
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});

		const sanction = await getSanction(sanctionId);
		expect(sanction).toMatchObject({
			userId: USER_ID,
			kind: 'warning',
			violationType: 'externalTrade',
			reportIds: ['report_1'],
			adminId: ADMIN_ID,
			status: 'active',
			suspendUntil: null,
		});
		expect(sanction?.target.snapshot.title).toBe('위반 글');

		const [post, otherPost, user] = await Promise.all([
			db.doc(POST_PATH).get(),
			db.doc(OTHER_POST_PATH).get(),
			db.doc(`Users/${USER_ID}`).get(),
		]);
		expect(post.data()).toMatchObject({ status: 'hidden', hiddenByAdmin: true });
		expect(otherPost.data()?.status).toBe('active');
		expect(user.data()?.report.suspendUntil).toBeNull();
	});

	it('댓글 경고는 댓글을 숨기고 게시글 댓글 수에서 댓글과 답글 수만큼 뺀다', async () => {
		await db.doc(COMMENT_PATH).set({ creatorId: USER_ID, body: '위반 댓글' });
		await db.doc(REPLY_PATH).set({ creatorId: 'someone', body: '답글' });

		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'abuse',
			target: { collectionName: 'Boards', postId: 'sanction_test_post', commentId: 'sanction_test_comment' },
		});

		const [comment, post] = await Promise.all([db.doc(COMMENT_PATH).get(), db.doc(POST_PATH).get()]);
		expect(comment.data()?.hiddenByAdmin).toBe(true);
		expect(post.data()?.commentCount).toBe(0);
		expect(post.data()?.status).toBe('active');
	});

	it('답글 경고는 답글을 숨기고 게시글 댓글 수에서 1을 뺀다', async () => {
		await db.doc(COMMENT_PATH).set({ creatorId: 'someone', body: '댓글' });
		await db.doc(REPLY_PATH).set({ creatorId: USER_ID, body: '위반 답글' });

		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'personalInfo',
			target: {
				collectionName: 'Boards',
				postId: 'sanction_test_post',
				commentId: 'sanction_test_comment',
				replyId: 'sanction_test_reply',
			},
		});

		const [reply, comment, post] = await Promise.all([
			db.doc(REPLY_PATH).get(),
			db.doc(COMMENT_PATH).get(),
			db.doc(POST_PATH).get(),
		]);
		expect(reply.data()?.hiddenByAdmin).toBe(true);
		expect(comment.data()?.hiddenByAdmin).toBeUndefined();
		expect(post.data()?.commentCount).toBe(1);
	});

	it('이미 숨긴 댓글 아래 답글을 숨기거나, 숨긴 답글이 있는 댓글을 숨겨도 댓글 수를 두 번 빼지 않는다', async () => {
		// 답글을 먼저 숨기고(2 → 1) 그 댓글을 숨기면 댓글 1개만 더 뺀다(1 → 0)
		await db.doc(COMMENT_PATH).set({ creatorId: USER_ID, body: '위반 댓글' });
		await db.doc(REPLY_PATH).set({ creatorId: USER_ID, body: '위반 답글' });
		const replyTarget = {
			collectionName: 'Boards',
			postId: 'sanction_test_post',
			commentId: 'sanction_test_comment',
			replyId: 'sanction_test_reply',
		};

		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'warning', violationType: 'abuse', target: replyTarget });
		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'abuse',
			target: { collectionName: 'Boards', postId: 'sanction_test_post', commentId: 'sanction_test_comment' },
		});
		expect((await db.doc(POST_PATH).get()).data()?.commentCount).toBe(0);

		// 같은 댓글에 다시 조치해도 더 빼지 않는다
		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'abuse',
			target: { collectionName: 'Boards', postId: 'sanction_test_post', commentId: 'sanction_test_comment' },
		});
		expect((await db.doc(POST_PATH).get()).data()?.commentCount).toBe(0);
	});

	it('대상 콘텐츠의 작성자가 조치 대상 유저와 다르면 거부하고 아무것도 쓰지 않는다', async () => {
		await db.doc(COMMENT_PATH).set({ creatorId: 'someone', body: '다른 사람 댓글' });

		await expect(
			issueSanctionHandler(ADMIN_ID, {
				userId: USER_ID,
				kind: 'warning',
				violationType: 'abuse',
				target: { collectionName: 'Boards', postId: 'sanction_test_post', commentId: 'sanction_test_comment' },
			}),
		).rejects.toMatchObject({ code: 'invalid-argument' });

		expect((await db.doc(COMMENT_PATH).get()).data()?.hiddenByAdmin).toBeUndefined();
		const sanctions = await db.collection('Sanctions').where('userId', '==', USER_ID).get();
		expect(sanctions.size).toBe(0);
	});

	it('채팅 위반 경고는 기록만 남긴다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'personalInfo',
			target: { chatId: 'chat_1' },
		});

		const sanction = await getSanction(sanctionId);
		expect(sanction?.target).toEqual({ chatId: 'chat_1' });
		expect((await db.doc(POST_PATH).get()).data()?.status).toBe('active');
	});

	it('7일 정지는 KST 0시 해제일을 기록하고 전체 글을 숨기며, 대상 글만 관리자 숨김으로 남긴다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'days7',
			violationType: 'fraud',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});

		const sanction = await getSanction(sanctionId);
		const suspendUntilMs = sanction?.suspendUntil.toMillis();
		expect(suspendUntilMs - Date.now()).toBeGreaterThan(6 * DAY_MS);
		expect(suspendUntilMs - Date.now()).toBeLessThanOrEqual(7 * DAY_MS);
		expect((suspendUntilMs + 9 * 60 * 60 * 1000) % DAY_MS).toBe(0);

		const [post, otherPost, user] = await Promise.all([
			db.doc(POST_PATH).get(),
			db.doc(OTHER_POST_PATH).get(),
			db.doc(`Users/${USER_ID}`).get(),
		]);
		expect(user.data()?.report.suspendUntil.toMillis()).toBe(suspendUntilMs);
		expect(post.data()).toMatchObject({ status: 'hidden', hiddenByAdmin: true });
		expect(otherPost.data()?.status).toBe('hidden');
		expect(otherPost.data()?.hiddenByAdmin).toBeUndefined();
	});

	it('정지 중 더 짧은 정지가 들어오면 기존 해제일을 유지한다', async () => {
		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days30', violationType: 'spam' });
		const before = (await db.doc(`Users/${USER_ID}`).get()).data()?.report.suspendUntil.toMillis();

		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days7', violationType: 'spam' });
		const after = (await db.doc(`Users/${USER_ID}`).get()).data()?.report.suspendUntil.toMillis();

		expect(after).toBe(before);
		const sanctions = await db.collection('Sanctions').where('userId', '==', USER_ID).get();
		expect(sanctions.size).toBe(2);
	});

	it('정지 중 더 긴 정지가 들어오면 해제일을 늦춘다', async () => {
		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days7', violationType: 'spam' });
		const before = (await db.doc(`Users/${USER_ID}`).get()).data()?.report.suspendUntil.toMillis();

		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days30', violationType: 'spam' });
		const after = (await db.doc(`Users/${USER_ID}`).get()).data()?.report.suspendUntil.toMillis();

		expect(after).toBeGreaterThan(before);
		expect(after).toBe((await getSanction(sanctionId))?.suspendUntil.toMillis());
	});

	it('영구 정지는 조치의 해제일을 비우고 유저 정지일을 아주 먼 날짜로 둔다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'permanent',
			violationType: 'fraud',
		});

		expect((await getSanction(sanctionId))?.suspendUntil).toBeNull();
		const user = (await db.doc(`Users/${USER_ID}`).get()).data();
		expect(user?.report.suspendUntil.toMillis()).toBe(PERMANENT_SUSPEND_UNTIL.getTime());
	});

	it('푸시 토큰이 있으면 조치 종류와 대상에 맞는 문구로 푸시를 보낸다', async () => {
		await db.doc(`Users/${USER_ID}`).update({ pushToken: 'ExponentPushToken[test]' });

		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'spam',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});
		await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'spam',
			target: { chatId: 'chat_1' },
		});
		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days7', violationType: 'spam' });

		expect(jest.mocked(sendPushNotification).mock.calls.map(([payload]) => payload)).toEqual([
			{
				to: 'ExponentPushToken[test]',
				title: '운영 정책 위반 안내',
				body: '운영 정책 위반으로 게시글이 비공개 처리되었습니다. 앱에서 내용을 확인해 주세요.',
			},
			{
				to: 'ExponentPushToken[test]',
				title: '운영 정책 위반 안내',
				body: '운영 정책 위반으로 경고를 받았습니다. 앱에서 내용을 확인해 주세요.',
			},
			{
				to: 'ExponentPushToken[test]',
				title: '계정 이용 제한 안내',
				body: '운영 정책 위반으로 계정 이용이 제한되었습니다. 앱에서 내용을 확인해 주세요.',
			},
		]);
	});

	it('댓글·답글 대상 경고 푸시는 댓글로 안내한다', () => {
		const commentTarget = { collectionName: 'Boards', postId: 'p1', commentId: 'c1' };
		const replyTarget = { ...commentTarget, replyId: 'r1' };
		const expected = '운영 정책 위반으로 댓글이 비공개 처리되었습니다. 앱에서 내용을 확인해 주세요.';

		expect(buildSanctionPush('warning', commentTarget).body).toBe(expected);
		expect(buildSanctionPush('warning', replyTarget).body).toBe(expected);
	});

	it('푸시 전송이 실패해도 조치는 성공한다', async () => {
		await db.doc(`Users/${USER_ID}`).update({ pushToken: 'ExponentPushToken[test]' });
		jest.mocked(sendPushNotification).mockRejectedValueOnce(new Error('push failed'));

		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'spam',
		});

		expect(await getSanction(sanctionId)).toBeDefined();
	});

	it('푸시 토큰이 없으면 푸시를 보내지 않는다', async () => {
		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'warning', violationType: 'spam' });
		expect(sendPushNotification).not.toHaveBeenCalled();
	});

	it('잘못된 요청은 거부한다', async () => {
		await expect(
			issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days3' as never, violationType: 'fraud' }),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'warning', violationType: 'other' as never }),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, {
				userId: USER_ID,
				kind: 'warning',
				violationType: 'fraud',
				target: { collectionName: 'Users', postId: USER_ID },
			}),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, {
				userId: USER_ID,
				kind: 'warning',
				violationType: 'fraud',
				target: { collectionName: 'Boards', postId: 'sanction_test_post/Comments/x' },
			}),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, {
				userId: USER_ID,
				kind: 'warning',
				violationType: 'fraud',
				target: { collectionName: 'Boards', postId: 'sanction_test_post', replyId: 'r1' },
			}),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, {
				userId: USER_ID,
				kind: 'warning',
				violationType: 'fraud',
				reportIds: [{ id: 'x' } as never],
			}),
		).rejects.toMatchObject({ code: 'invalid-argument' });
		await expect(
			issueSanctionHandler(ADMIN_ID, { userId: 'no_such_user', kind: 'warning', violationType: 'fraud' }),
		).rejects.toMatchObject({ code: 'not-found' });
	});

	it('요청의 대상에서 정해진 키만 저장하고, 스냅샷은 서버가 읽은 문서로만 채운다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'fraud',
			target: {
				collectionName: 'Boards',
				postId: 'deleted_post',
				snapshot: { title: '가짜 제목' },
				extra: 'x',
			} as never,
		});

		expect((await getSanction(sanctionId))?.target).toEqual({
			collectionName: 'Boards',
			postId: 'deleted_post',
		});
	});
});

describe('권장 조치', () => {
	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('이번 조치를 포함한 위반 횟수로 권장 조치를 정한다', () => {
		expect(getRecommendedSanctionKind(0)).toBe('warning');
		expect(getRecommendedSanctionKind(1)).toBe('days7');
		expect(getRecommendedSanctionKind(2)).toBe('days30');
		expect(getRecommendedSanctionKind(3)).toBe('permanent');
		expect(getRecommendedSanctionKind(10)).toBe('permanent');
	});

	it('90일이 지났거나 취소된 조치는 횟수에서 뺀다', async () => {
		const base = { userId: USER_ID, kind: 'warning', violationType: 'spam', reportIds: [], adminId: ADMIN_ID, suspendUntil: null };
		await Promise.all([
			db.collection('Sanctions').add({ ...base, status: 'active', createdAt: Timestamp.fromMillis(Date.now() - 10 * DAY_MS) }),
			db.collection('Sanctions').add({ ...base, status: 'active', createdAt: Timestamp.fromMillis(Date.now() - 91 * DAY_MS) }),
			db.collection('Sanctions').add({ ...base, status: 'canceled', createdAt: Timestamp.fromMillis(Date.now() - 5 * DAY_MS) }),
		]);

		await expect(getSanctionRecommendationHandler(USER_ID)).resolves.toEqual({
			recentActiveCount: 1,
			recommendedKind: 'days7',
		});
	});
});

describe('이의 신청 결정·조치 취소', () => {
	const pendingAppeal = { content: '규칙을 몰랐습니다.', status: 'pending', createdAt: Timestamp.now() };

	beforeEach(async () => {
		await cleanupTestData();
		await db.doc(`Users/${USER_ID}`).set({
			displayName: '조치 대상',
			pushToken: 'ExponentPushToken[user]',
			report: { total: 1, recent30Days: 1, suspendUntil: null },
		});
		await db.doc(POST_PATH).set({ creatorId: USER_ID, title: '위반 글', status: 'active', commentCount: 2 });
		await db.doc(OTHER_POST_PATH).set({ creatorId: USER_ID, title: '다른 글', status: 'active' });
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	it('조치 유지는 답변만 저장하고 조치는 유효로 남기며 결과 푸시를 보낸다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'spam',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });
		jest.mocked(sendPushNotification).mockClear();

		await decideAppealHandler({ sanctionId, result: 'upheld', reply: ' 조치를 유지합니다. ' });

		const sanction = await getSanction(sanctionId);
		expect(sanction?.status).toBe('active');
		expect(sanction?.appeal).toMatchObject({ status: 'reviewed', result: 'upheld', reply: '조치를 유지합니다.' });
		expect(sanction?.appeal.repliedAt).toBeDefined();
		expect((await db.doc(POST_PATH).get()).data()?.hiddenByAdmin).toBe(true);
		expect(sendPushNotification).toHaveBeenCalledWith({
			to: 'ExponentPushToken[user]',
			title: '이의 신청 결과 안내',
			body: '이의 신청 검토가 끝났습니다. 앱에서 내용을 확인해 주세요.',
			data: { url: `animal-crossing-trading-app://inquiry/${sanctionId}` },
		});
	});

	it('경고 조치 취소는 조치를 취소하고 숨긴 글을 다시 공개한다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'spam',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });

		await decideAppealHandler({ sanctionId, result: 'canceled', reply: '조치를 취소합니다.' });

		expect((await getSanction(sanctionId))?.status).toBe('canceled');
		const post = (await db.doc(POST_PATH).get()).data();
		expect(post?.status).toBe('active');
		expect(post?.hiddenByAdmin).toBeUndefined();
	});

	it('유일한 정지를 취소하면 정지를 바로 풀고 정지 때 숨긴 글과 대상 글을 공개한다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'days7',
			violationType: 'spam',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });

		await decideAppealHandler({ sanctionId, result: 'canceled', reply: '조치를 취소합니다.' });

		const [user, post, otherPost] = await Promise.all([
			db.doc(`Users/${USER_ID}`).get(),
			db.doc(POST_PATH).get(),
			db.doc(OTHER_POST_PATH).get(),
		]);
		expect(user.data()?.report.suspendUntil).toBeNull();
		expect(post.data()?.status).toBe('active');
		expect(otherPost.data()?.status).toBe('active');
	});

	it('두 정지 중 더 긴 것을 취소하면 남은 정지의 해제일로 줄이고, 대상 글은 정지가 끝날 때까지 숨김을 유지한다', async () => {
		const { sanctionId: shortId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'days7',
			violationType: 'spam',
		});
		const { sanctionId: longId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'days30',
			violationType: 'spam',
			target: { collectionName: 'Boards', postId: 'sanction_test_post' },
		});
		await db.doc(`Sanctions/${longId}`).update({ appeal: pendingAppeal });

		await decideAppealHandler({ sanctionId: longId, result: 'canceled', reply: '조치를 취소합니다.' });

		const shortUntil = (await getSanction(shortId))?.suspendUntil.toMillis();
		const user = (await db.doc(`Users/${USER_ID}`).get()).data();
		expect(user?.report.suspendUntil.toMillis()).toBe(shortUntil);
		const post = (await db.doc(POST_PATH).get()).data();
		expect(post?.hiddenByAdmin).toBeUndefined();
		expect(post?.status).toBe('hidden');
	});

	it('관리자가 이미 정지를 해제했다면 조치를 취소해도 다시 정지하지 않는다', async () => {
		await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days30', violationType: 'spam' });
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'days7', violationType: 'spam' });
		await db.doc(`Users/${USER_ID}`).update({ 'report.suspendUntil': null });
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });

		await decideAppealHandler({ sanctionId, result: 'canceled', reply: '조치를 취소합니다.' });

		expect((await db.doc(`Users/${USER_ID}`).get()).data()?.report.suspendUntil).toBeNull();
	});

	it('댓글 경고를 취소하면 댓글을 공개하고 댓글 수를 되돌린다', async () => {
		await db.doc(COMMENT_PATH).set({ creatorId: USER_ID, body: '위반 댓글' });
		await db.doc(REPLY_PATH).set({ creatorId: 'someone', body: '답글' });
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, {
			userId: USER_ID,
			kind: 'warning',
			violationType: 'abuse',
			target: { collectionName: 'Boards', postId: 'sanction_test_post', commentId: 'sanction_test_comment' },
		});
		expect((await db.doc(POST_PATH).get()).data()?.commentCount).toBe(0);

		await cancelSanctionHandler({ sanctionId });

		expect((await db.doc(COMMENT_PATH).get()).data()?.hiddenByAdmin).toBeUndefined();
		expect((await db.doc(POST_PATH).get()).data()?.commentCount).toBe(2);
		expect((await getSanction(sanctionId))?.status).toBe('canceled');
	});

	it('이의 신청 검토 중인 조치는 신고 상세의 조치 취소로 취소할 수 없다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'warning', violationType: 'spam' });
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });

		await expect(cancelSanctionHandler({ sanctionId })).rejects.toMatchObject({ code: 'failed-precondition' });
		expect((await getSanction(sanctionId))?.status).toBe('active');
	});

	it('검토 중인 이의 신청이 없거나 답변이 비면 거부한다', async () => {
		const { sanctionId } = await issueSanctionHandler(ADMIN_ID, { userId: USER_ID, kind: 'warning', violationType: 'spam' });

		await expect(decideAppealHandler({ sanctionId, result: 'upheld', reply: '답변' })).rejects.toMatchObject({
			code: 'failed-precondition',
		});
		await db.doc(`Sanctions/${sanctionId}`).update({ appeal: pendingAppeal });
		await expect(decideAppealHandler({ sanctionId, result: 'upheld', reply: '  ' })).rejects.toMatchObject({
			code: 'invalid-argument',
		});
		await expect(decideAppealHandler({ sanctionId, result: 'other', reply: '답변' })).rejects.toMatchObject({
			code: 'invalid-argument',
		});
	});
});
