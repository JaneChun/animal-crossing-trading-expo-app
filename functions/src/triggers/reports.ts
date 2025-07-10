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
		const now = Date.now();
		const suspendMillis = suspendUntil?.toMillis?.() || 0;
		let newSuspendMillis = suspendMillis;

		if (recent30Days >= 7) {
			// 최근 30일 신고 7회 이상 → 30일 정지 + 관리자 플래그
			newSuspendMillis = Math.max(
				suspendMillis,
				now + 30 * 24 * 60 * 60 * 1000,
			);
			needsAdminReview = true;
		} else if (recent7Days >= 3) {
			// 최근 7일 신고 3회 이상 → 7일 정지
			newSuspendMillis = Math.max(suspendMillis, now + 7 * 24 * 60 * 60 * 1000);
		}

		// 정지 기간 업데이트
		if (newSuspendMillis > suspendMillis) {
			suspendUntil = Timestamp.fromMillis(newSuspendMillis);
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
		console.error('유저 신고 실패:', error);
		throw error; // 에러를 다시 throw하여 상위 함수에서 적절히 처리하도록
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
