import { Timestamp } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { auth, db } from '../utils/common';

/**
 * 사용자 삭제 및 아카이브 처리
 * @param uid - 삭제할 사용자 ID
 * @returns Promise<{message: string}>
 */
export async function deleteUserAndArchive(
	uid: string,
): Promise<{ message: string }> {
	if (!uid) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'uid 파라미터가 누락되었습니다.',
		);
	}

	try {
		// 사용자 데이터 조회
		const userSnap = await db.collection('Users').doc(uid).get();
		if (!userSnap.exists) {
			throw new functions.https.HttpsError(
				'not-found',
				'존재하지 않는 유저입니다.',
			);
		}

		const userData = userSnap.data();

		// 1. Auth: 사용자 삭제
		await auth.deleteUser(uid);

		// 2. Firestore: Users 삭제 & DeletedUsers로 이동
		const batch = db.batch();

		const deletedRef = db.collection('DeletedUsers').doc(uid);
		batch.set(deletedRef, {
			...userData,
			deletedAt: Timestamp.now(),
		});

		const userRef = db.collection('Users').doc(uid);
		batch.delete(userRef);

		await batch.commit();

		return { message: '유저 삭제에 성공했습니다.' };
	} catch (error: any) {
		console.error(`유저 ${uid} 삭제 실패:`, error);

		// 이미 HttpsError로 던져진 경우 그대로 재던짐
		if (error instanceof functions.https.HttpsError) {
			throw error;
		}

		// 그 외 예외만 internal로 감싸기
		throw new functions.https.HttpsError(
			'internal',
			'유저 삭제 중 오류가 발생했습니다.',
			error.message,
		);
	}
}
