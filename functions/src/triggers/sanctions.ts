import { SanctionDoc } from '../types/sanction';

/**
 * 유저가 경고를 확인하면 '유저 확인 대기'에서 '처리 완료'로 옮긴다
 * 확인 시각은 앱이 보안 규칙 안에서 직접 기록하고, 단계는 이 트리거만 쓴다
 * 확인과 동시에 이의 신청이 들어와 '답변 필요'가 되었으면 그대로 둔다
 * @param sanctionRef - 조치 문서
 * @param before - 변경 전 조치
 * @param after - 변경 후 조치
 */
export async function handleSanctionUpdated(
	sanctionRef: FirebaseFirestore.DocumentReference,
	before: SanctionDoc,
	after: SanctionDoc,
): Promise<void> {
	const isNewlyAcknowledged = !before.acknowledgedAt && !!after.acknowledgedAt;
	if (!isNewlyAcknowledged || after.reviewStage !== 'awaitingUser') return;

	// 트리거가 읽은 뒤 이의 신청이 들어올 수 있으므로 단계를 다시 확인하며 바꾼다
	await sanctionRef.firestore.runTransaction(async (transaction) => {
		const current = (await transaction.get(sanctionRef)).data() as SanctionDoc | undefined;
		if (current?.reviewStage !== 'awaitingUser') return;

		transaction.update(sanctionRef, { reviewStage: 'done' });
	});
}
