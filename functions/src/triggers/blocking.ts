import { db } from '../utils/common';

/**
 * 사용자 차단 시 양방향 차단 관계 설정
 * @param userId - 차단하는 사용자 ID
 * @param blockedUserId - 차단당하는 사용자 ID
 * @param blockedAt - 차단 시간
 */
export async function handleUserBlocked(
	userId: string,
	blockedUserId: string,
	blockedAt: any,
): Promise<void> {
	try {
		// 차단당한 사용자의 BlockedBy 컬렉션에 추가
		await db
			.collection('Users')
			.doc(blockedUserId)
			.collection('BlockedBy')
			.doc(userId)
			.set(
				{
					id: userId,
					blockedAt,
				},
				{ merge: true },
			);
	} catch (error) {
		console.error('유저 차단 실패:', error);
	}
}

/**
 * 사용자 차단 해제 시 양방향 차단 관계 해제
 * @param userId - 차단 해제하는 사용자 ID
 * @param blockedUserId - 차단 해제당하는 사용자 ID
 */
export async function handleUserUnblocked(
	userId: string,
	blockedUserId: string,
): Promise<void> {
	try {
		// 차단당한 사용자의 BlockedBy 컬렉션에서 제거
		await db
			.collection('Users')
			.doc(blockedUserId)
			.collection('BlockedBy')
			.doc(userId)
			.delete();
	} catch (error) {
		console.error('유저 차단 해제 실패:', error);
	}
}
