import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../utils/common';

interface ReportData {
	reporteeId: string;
	createdAt: Timestamp;
}

interface UserReport {
	total: number;
	suspendUntil: Timestamp | null;
	needsAdminReview: boolean;
}

/**
 * 신고 생성 시 사용자 신고 정보 업데이트
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

		const userInfo = userSnap.data();
		const userReport: UserReport = userInfo?.report ?? {
			total: 0,
			suspendUntil: null,
			needsAdminReview: false,
		};

		const total = userReport.total + 1;
		let suspendUntil = userReport.suspendUntil;
		let needsAdminReview = false;

		// 최근 신고 횟수 계산
		const { recent7Days, recent30Days } = await getRecentReportCounts(
			reporteeId,
		);

		// 정지 처리 로직
		const now = new Date();
		const currentSuspendDate = suspendUntil ? suspendUntil.toDate() : null;
		let newSuspendDate: Date | null = null;

		if (recent30Days >= 7) {
			// 최근 30일 신고 7회 이상 → 30일 정지 + 관리자 플
			const thirtyDaysLater = new Date(
				now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }),
			);
			thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
			thirtyDaysLater.setHours(0, 0, 0, 0); // 한국 시간 00:00:00으로 설정

			if (!currentSuspendDate || thirtyDaysLater > currentSuspendDate) {
				newSuspendDate = thirtyDaysLater;
			}
			needsAdminReview = true;
		} else if (recent7Days >= 3) {
			// 최근 7일 신고 3회 이상 → 7일 정지
			const sevenDaysLater = new Date(
				now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }),
			);
			sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
			sevenDaysLater.setHours(0, 0, 0, 0); // 한국 시간 00:00:00으로 설정

			if (!currentSuspendDate || sevenDaysLater > currentSuspendDate) {
				newSuspendDate = sevenDaysLater;
			}
		}

		// 정지 기간 업데이트
		if (newSuspendDate !== null) {
			suspendUntil = Timestamp.fromDate(newSuspendDate);

			// 계정 정지 시 게시글 처리
			await handleUserPostsOnSuspension(reporteeId);
		}

		// 유저 도큐먼트 업데이트
		await userDocRef.set(
			{
				report: {
					total,
					recent30Days,
					suspendUntil,
					...(needsAdminReview ? { needsAdminReview: true } : {}),
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
async function handleUserPostsOnSuspension(userId: string): Promise<void> {
	try {
		const batch = db.batch();

		// 사용자의 다른 게시글들 숨김 처리
		const [boardPosts, communityPosts] = await Promise.all([
			db.collection('Boards').where('creatorId', '==', userId).get(),
			db.collection('Communities').where('creatorId', '==', userId).get(),
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

		hiddenBoardPosts.docs.forEach((doc) => {
			batch.update(doc.ref, { status: 'active' });
		});

		hiddenCommunityPosts.docs.forEach((doc) => {
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
 * 최근 신고 횟수 계산
 * @param reporteeId - 신고당한 사용자 ID
 * @returns Promise<{recent7Days: number, recent30Days: number}>
 */
async function getRecentReportCounts(reporteeId: string): Promise<{
	recent7Days: number;
	recent30Days: number;
}> {
	try {
		const now = Date.now();
		const sevenDaysAgo = Timestamp.fromDate(
			new Date(now - 7 * 24 * 60 * 60 * 1000),
		);
		const thirtyDaysAgo = Timestamp.fromDate(
			new Date(now - 30 * 24 * 60 * 60 * 1000),
		);

		const [recent7DaysSnap, recent30DaysSnap] = await Promise.all([
			db
				.collection('Reports')
				.where('reporteeId', '==', reporteeId)
				.where('createdAt', '>=', sevenDaysAgo)
				.get(),
			db
				.collection('Reports')
				.where('reporteeId', '==', reporteeId)
				.where('createdAt', '>=', thirtyDaysAgo)
				.get(),
		]);

		return {
			recent7Days: recent7DaysSnap.size,
			recent30Days: recent30DaysSnap.size,
		};
	} catch (error) {
		console.error('Reports 컬렉션 쿼리 실패:', error);
		throw error; // 에러를 다시 throw하여 상위 함수에서 적절히 처리하도록
	}
}
