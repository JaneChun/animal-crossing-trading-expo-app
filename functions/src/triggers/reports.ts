import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../utils/common';

interface ReportData {
	reporteeId: string;
	createdAt: Timestamp;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 한국 날짜 기준 days일 뒤의 한국 시간 00:00:00을 반환
 * 실행 환경의 타임존(Cloud Functions는 UTC)과 무관하게 동작하도록 고정 오프셋으로 계산한다.
 * @param now - 기준 시각
 * @param days - 더할 일수
 */
export function getKstMidnightAfterDays(now: Date, days: number): Date {
	const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
	const kstMidnightAsUtcMs = Date.UTC(
		kstNow.getUTCFullYear(),
		kstNow.getUTCMonth(),
		kstNow.getUTCDate() + days,
	);
	return new Date(kstMidnightAsUtcMs - KST_OFFSET_MS);
}

/**
 * 신고 생성 시 사용자 신고 집계 업데이트
 * 신고 수만으로 정지하지 않는다. 정지는 관리자 조치(admin/sanction.ts)로만 건다
 * @param report - 신고 데이터
 */
export async function handleUserReport(report: ReportData): Promise<void> {
	const { reporteeId } = report;

	if (!reporteeId) {
		return;
	}

	try {
		// 유저 정보 가져오기
		const userDocRef = db.collection('Users').doc(reporteeId);
		const userSnap = await userDocRef.get();

		if (!userSnap.exists) {
			return;
		}

		const recent30Days = await getRecent30DaysReportCount(reporteeId);

		// total은 increment로 올리고 suspendUntil은 쓰지 않는다. 읽은 값을 다시 쓰면 동시에 들어온 신고나 관리자 정지를 덮어쓴다
		await userDocRef.set(
			{
				report: {
					total: FieldValue.increment(1),
					recent30Days,
				},
			},
			{ merge: true },
		);
	} catch (error) {
		console.error('유저 신고 처리 실패:', error);
		throw error;
	}
}

/**
 * 계정 정지 시 사용자의 게시글 처리
 * @param userId - 정지된 사용자 ID
 */
export async function handleUserPostsOnSuspension(userId: string): Promise<void> {
	try {
		const batch = db.batch();

		// 사용자의 공개 게시글만 숨김 처리
		// 삭제된 글까지 hidden으로 바꾸면 정지 해제 때 active로 복구되어 되살아난다
		const [boardPosts, communityPosts] = await Promise.all([
			db
				.collection('Boards')
				.where('creatorId', '==', userId)
				.where('status', '==', 'active')
				.get(),
			db
				.collection('Communities')
				.where('creatorId', '==', userId)
				.where('status', '==', 'active')
				.get(),
		]);

		boardPosts.docs.forEach((doc) => {
			batch.update(doc.ref, { status: 'hidden' });
		});

		communityPosts.docs.forEach((doc) => {
			batch.update(doc.ref, { status: 'hidden' });
		});

		await batch.commit();
		console.log(`사용자 ${userId}의 게시글 숨김 처리 완료`);
	} catch (error) {
		console.error(`사용자 ${userId}의 게시글 숨김 처리 실패: `, error);
		throw error;
	}
}

/**
 * 정지 해제 시 사용자의 숨김 게시글 복구
 * @param userId - 정지 해제된 사용자 ID
 */
export async function restoreUserPostsAfterSuspension(
	userId: string,
): Promise<void> {
	try {
		const batch = db.batch();

		// 숨김 상태인 게시글들 조회
		const [hiddenBoardPosts, hiddenCommunityPosts] = await Promise.all([
			db
				.collection('Boards')
				.where('creatorId', '==', userId)
				.where('status', '==', 'hidden')
				.get(),
			db
				.collection('Communities')
				.where('creatorId', '==', userId)
				.where('status', '==', 'hidden')
				.get(),
		]);

		// 관리자가 숨긴 글은 정지 해제와 무관하므로 복구하지 않는다
		[...hiddenBoardPosts.docs, ...hiddenCommunityPosts.docs]
			.filter((doc) => doc.data().hiddenByAdmin !== true)
			.forEach((doc) => {
				batch.update(doc.ref, { status: 'active' });
			});

		await batch.commit();
		console.log(`사용자 ${userId}의 게시글 복구 완료`);
	} catch (error) {
		console.error(`사용자 ${userId}의 게시글 복구 실패: `, error);
		throw error;
	}
}

/**
 * 사용자 정지 해제: suspendUntil을 비우고 정지 때 숨겨진 게시글을 복구한다
 * 0시 스케줄러(만료된 정지)와 관리자 정지 해제 callable이 함께 쓴다
 * @param userId - 정지 해제할 사용자 ID
 */
export async function liftUserSuspension(userId: string): Promise<void> {
	await db.collection('Users').doc(userId).update({
		'report.suspendUntil': null,
	});
	await restoreUserPostsAfterSuspension(userId);
}

/**
 * 최근 30일 신고 횟수 계산
 * @param reporteeId - 신고당한 사용자 ID
 * @returns 최근 30일 신고 수
 */
async function getRecent30DaysReportCount(reporteeId: string): Promise<number> {
	try {
		const thirtyDaysAgo = Timestamp.fromDate(
			new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		);

		const recent30DaysSnap = await db
			.collection('Reports')
			.where('reporteeId', '==', reporteeId)
			.where('createdAt', '>=', thirtyDaysAgo)
			.get();

		return recent30DaysSnap.size;
	} catch (error) {
		console.error('Reports 컬렉션 쿼리 실패:', error);
		throw error; // 에러를 다시 throw하여 상위 함수에서 적절히 처리하도록
	}
}
