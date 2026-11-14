import { HttpsError } from 'firebase-functions/v2/https';
import { liftUserSuspension } from '../triggers/reports';

/**
 * 관리자 정지 해제: 즉시 정지를 풀고 정지 때 숨겨진 게시글을 복구한다
 * @param uid - 정지 해제할 유저 UID
 */
export async function liftSuspensionHandler(uid: string): Promise<void> {
	if (!uid || typeof uid !== 'string') {
		throw new HttpsError('invalid-argument', 'uid가 필요합니다.');
	}

	await liftUserSuspension(uid);
}
