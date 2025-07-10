import * as admin from 'firebase-admin';

// Firebase Admin이 아직 초기화되지 않았다면 초기화
if (!admin.apps.length) {
	admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();

/**
 * UID(사용자 ID)를 Firestore에서 필드 이름으로 쓸 수 있는 형식으로 변환
 * @param uid - 점(.)이 포함되어 있을 수 있는 사용자 ID
 * @returns Firestore에서 필드 이름으로 사용 가능한 UID
 */
export function getSafeUid(uid: string): string {
	return uid.replace(/\./g, '');
}

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 * @param text - 자를 텍스트
 * @param maxLength - 자르기 전 최대 길이
 * @returns 필요시 말줄임표가 추가된 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.substring(0, maxLength) + '...';
}

/**
 * 사용자가 최근 30일 이내에 탈퇴한 적이 있는지 확인
 * @param providerId - 확인할 사용자 고유 ID
 * @returns Promise<boolean> - 30일 이내 탈퇴한 경우 true를 반환
 */
export async function isUserRestrictedFromRejoining(
	providerId: string,
): Promise<boolean> {
	try {
		const deletedDoc = await db.doc(`DeletedUsers/${providerId}`).get();

		if (!deletedDoc.exists) {
			return false;
		}

		const data = deletedDoc.data();
		const { deletedAt } = data || {};

		// deletedAt 필드가 없거나 잘못된 형태인 경우 허용
		if (!deletedAt || typeof deletedAt.toDate !== 'function') {
			console.warn(
				`사용자 ${providerId}의 deletedAt 데이터가 유효하지 않습니다:`,
				data,
			);

			return false;
		}

		const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
		return Date.now() - deletedAt.toDate().getTime() < thirtyDaysInMillis;
	} catch (error) {
		// 에러 발생 시에는 회원가입 제한
		console.error(
			`사용자 ${providerId}에 대한 회원가입 제한 여부 확인 중 오류가 발생했습니다:`,
			error,
		);
		throw error;
	}
}
