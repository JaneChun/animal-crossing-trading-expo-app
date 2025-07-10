import { db } from '../utils/common';

interface ReviewData {
	receiverId: string;
	value: number; // 1 for positive, -1 for negative
}

interface UserReview {
	total: number;
	positive: number;
	negative: number;
	badgeGranted: boolean;
}

/**
 * 리뷰 생성 시 사용자 리뷰 정보 업데이트
 * @param review - 리뷰 데이터
 */
export async function handleUserReview(review: ReviewData): Promise<void> {
	const { receiverId, value } = review;

	if (!receiverId) {
		return;
	}

	try {
		// 유저 정보 가져오기
		const userDocRef = db.collection('Users').doc(receiverId);
		const userSnap = await userDocRef.get();

		if (!userSnap.exists) {
			return;
		}

		const userInfo = userSnap.data();
		const userReview: UserReview = userInfo?.review || {
			total: 0,
			positive: 0,
			negative: 0,
			badgeGranted: false,
		};

		const total = userReview.total + 1;
		const positive = userReview.positive + (value === 1 ? 1 : 0);
		const negative = userReview.negative + (value === -1 ? 1 : 0);

		// 뱃지 부여 조건: total >= 10, 긍정 비율 ≥ 80%
		const badgeGranted = total >= 10 && positive / total >= 0.8;

		// 유저 도큐먼트 업데이트
		await userDocRef.update({
			review: {
				total,
				positive,
				negative,
				badgeGranted,
			},
		});
	} catch (error) {
		console.error('리뷰 작성 실패:', error);
	}
}
