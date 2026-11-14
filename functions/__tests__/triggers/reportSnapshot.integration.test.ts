/**
 * triggers/reportSnapshot.ts 통합 테스트
 * 신고 시점 스냅샷 기록을 에뮬레이터로 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

const { db } = createTestApp('report-snapshot-integration-test');

jest.mock('../../src/utils/common', () => ({
	db,
}));

import { saveReportSnapshot } from '../../src/triggers/reportSnapshot';

const POST_PATH = 'Boards/snapshot_post';
const COMMENT_PATH = `${POST_PATH}/Comments/snapshot_comment`;
const REPLY_PATH = `${COMMENT_PATH}/Replies/snapshot_reply`;
const REPORT_PATH = 'Reports/snapshot_report';
const POST_DATA = {
	title: '게시글 제목',
	body: '게시글 본문',
	creatorId: 'b',
	images: ['https://example.com/a.png'],
	status: 'active',
};

async function cleanupTestData() {
	await Promise.all(
		[REPLY_PATH, COMMENT_PATH, POST_PATH, REPORT_PATH, 'Users/snapshot_user'].map((path) =>
			db.doc(path).delete(),
		),
	);
}

describe('신고 시점 스냅샷 기록', () => {
	beforeEach(async () => {
		await cleanupTestData();
		await db.doc(POST_PATH).set(POST_DATA);
		await db.doc(COMMENT_PATH).set({ body: '댓글 본문', creatorId: 'b' });
		await db.doc(REPLY_PATH).set({ body: '답글 본문', creatorId: 'b' });
		await db.doc(REPORT_PATH).set({ reporterId: 'a', reporteeId: 'b', category: 'spam' });
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	const getSnapshot = async () => (await db.doc(REPORT_PATH).get()).data()?.snapshot;

	it('게시글 신고면 게시글 문서 전체를 복사한다', async () => {
		await saveReportSnapshot(db.doc(REPORT_PATH), {
			collectionName: 'Boards',
			postId: 'snapshot_post',
		});

		expect(await getSnapshot()).toEqual(POST_DATA);
	});

	it('댓글 신고면 댓글 문서 전체를 복사한다', async () => {
		await saveReportSnapshot(db.doc(REPORT_PATH), {
			collectionName: 'Boards',
			postId: 'snapshot_post',
			commentId: 'snapshot_comment',
		});

		expect(await getSnapshot()).toEqual({ body: '댓글 본문', creatorId: 'b' });
	});

	it('답글 신고면 답글 문서 전체를 복사한다', async () => {
		await saveReportSnapshot(db.doc(REPORT_PATH), {
			collectionName: 'Boards',
			postId: 'snapshot_post',
			commentId: 'snapshot_comment',
			replyId: 'snapshot_reply',
		});

		expect(await getSnapshot()).toEqual({ body: '답글 본문', creatorId: 'b' });
	});

	it('재신고로 게시글·댓글 대상이 없어지면 이전 스냅샷을 지운다', async () => {
		await db.doc(REPORT_PATH).update({ snapshot: { body: '이전 내용' } });

		await saveReportSnapshot(db.doc(REPORT_PATH), {});

		expect(await getSnapshot()).toBeUndefined();
	});

	it('게시판이 아닌 컬렉션은 읽지 않는다', async () => {
		await db.doc('Users/snapshot_user').set({ title: '비공개', body: '비공개 내용' });

		await saveReportSnapshot(db.doc(REPORT_PATH), {
			collectionName: 'Users',
			postId: 'snapshot_user',
		});

		expect(await getSnapshot()).toBeUndefined();
	});
});
