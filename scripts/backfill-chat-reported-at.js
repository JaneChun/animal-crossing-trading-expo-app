/**
 * 기존 채팅 신고에 Chats.reportedAt을 채우는 1회성 스크립트
 *
 * 관리자 채팅 열람 규칙은 Chats 문서에 reportedAt이 있을 때만 읽기를 허용한다.
 * onReportWritten 함수 배포 이전에 들어온 채팅 신고는 이 값이 없으므로 배포 직후 한 번 실행한다.
 *
 * 실행
 *   node scripts/backfill-chat-reported-at.js --emulator          # 에뮬레이터, 변경 대상만 출력
 *   node scripts/backfill-chat-reported-at.js --emulator --apply  # 에뮬레이터에 기록
 *   node scripts/backfill-chat-reported-at.js --apply             # 운영에 기록 (Application Default Credentials 필요)
 *
 * 운영 인증: `gcloud auth application-default login` 또는 GOOGLE_APPLICATION_CREDENTIALS=<서비스 계정 키 경로>
 */
const isEmulator = process.argv.includes('--emulator');
const shouldApply = process.argv.includes('--apply');

if (isEmulator) {
	process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'animal-crossing-trade-expo-app';

async function main() {
	initializeApp({ projectId: PROJECT_ID });
	const db = getFirestore();

	console.log(
		`대상: ${isEmulator ? '에뮬레이터' : '운영'} (${PROJECT_ID}), 모드: ${shouldApply ? '기록' : '확인만'}`,
	);

	const reportsSnapshot = await db.collection('Reports').where('chatId', '!=', null).get();

	// 같은 채팅방이 여러 번 신고되었으면 가장 이른 신고 시각을 쓴다
	const earliestReportByChat = new Map();
	reportsSnapshot.docs.forEach((doc) => {
		const { chatId, createdAt } = doc.data();
		if (!chatId || !createdAt) return;

		const current = earliestReportByChat.get(chatId);
		if (!current || createdAt.toMillis() < current.toMillis()) {
			earliestReportByChat.set(chatId, createdAt);
		}
	});

	let updatedCount = 0;
	let skippedCount = 0;

	for (const [chatId, reportedAt] of earliestReportByChat) {
		const chatRef = db.doc(`Chats/${chatId}`);
		const chatSnap = await chatRef.get();

		if (!chatSnap.exists || chatSnap.data().reportedAt) {
			skippedCount += 1;
			continue;
		}

		console.log(`- Chats/${chatId} ← reportedAt ${reportedAt.toDate().toISOString()}`);
		if (shouldApply) {
			await chatRef.update({ reportedAt });
		}
		updatedCount += 1;
	}

	console.log(
		`채팅 신고 ${earliestReportByChat.size}건 중 ${updatedCount}건 ${shouldApply ? '기록' : '기록 예정'}, ${skippedCount}건 건너뜀(문서 없음 또는 이미 있음)`,
	);
}

main().catch((error) => {
	console.error('❌ 실패:', error);
	process.exit(1);
});
