import * as functions from 'firebase-functions';
import {
	onDocumentCreated,
	onDocumentDeleted,
} from 'firebase-functions/v2/firestore';

// Auth functions
import { createFirebaseCustomToken } from './auth/customToken';

// Notification handlers
import { handleChatMessageCreated } from './notifications/chat';
import { handleCommentNotification } from './notifications/comments';

// Trigger handlers
import { handleUserBlocked, handleUserUnblocked } from './triggers/blocking';
import {
	handleCommentCreated,
	handleCommentDeleted,
} from './triggers/comments';
import { handleUserReport } from './triggers/reports';
import { handleUserReview } from './triggers/reviews';
import { deleteUserAndArchive as deleteUserAndArchiveHandler } from './triggers/userManagement';

// ===============================
// HTTP Functions
// ===============================

/**
 * Firebase Custom Token 생성 함수
 * 카카오, 네이버, Apple OAuth 토큰을 Firebase Custom Token으로 변환
 */
export const getFirebaseCustomToken = functions.https.onCall(
	async (request) => {
		return await createFirebaseCustomToken(request.data);
	},
);

/**
 * 사용자 삭제 및 아카이브 함수
 * 사용자 계정을 삭제하고 DeletedUsers 컬렉션으로 이동
 */
export const deleteUserAndArchive = functions.https.onCall(async (request) => {
	const { uid } = request.data;
	return await deleteUserAndArchiveHandler(uid);
});

// ===============================
// Firestore Triggers
// ===============================

/**
 * 채팅 메시지 생성 시 트리거
 * 채팅방 정보 업데이트 및 푸시 알림 전송
 */
export const onMessageCreated = onDocumentCreated(
	'Chats/{chatId}/Messages/{messageId}',
	async (event) => {
		const { chatId } = event.params;
		const snapshot = event.data;
		if (!snapshot) return;

		const message = snapshot.data() as any;
		await handleChatMessageCreated(chatId, message);
	},
);

/**
 * 알림 생성 시 트리거
 * 푸시 알림 전송
 */
export const onNotificationCreated = onDocumentCreated(
	'Notifications/{notificationId}',
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) return;

		const notification = snapshot.data() as any;
		await handleCommentNotification(notification, event.params.notificationId);
	},
);

/**
 * 댓글 생성 시 트리거
 * 게시글의 댓글 수 증가
 */
export const onCommentCreated = onDocumentCreated(
	'{collection}/{postId}/Comments/{commentId}',
	async (event) => {
		const { collection, postId } = event.params;
		await handleCommentCreated(collection, postId);
	},
);

/**
 * 댓글 삭제 시 트리거
 * 게시글의 댓글 수 감소
 */
export const onCommentDeleted = onDocumentDeleted(
	'{collection}/{postId}/Comments/{commentId}',
	async (event) => {
		const { collection, postId } = event.params;
		await handleCommentDeleted(collection, postId);
	},
);

/**
 * 신고 생성 시 트리거
 * 사용자 신고 정보 업데이트 및 정지 처리
 */
export const updateUserReport = onDocumentCreated(
	'Reports/{reportId}',
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) return;

		const report = snapshot.data() as any;
		await handleUserReport(report);
	},
);

/**
 * 리뷰 생성 시 트리거
 * 사용자 리뷰 정보 업데이트 및 뱃지 부여
 */
export const updateUserReview = onDocumentCreated(
	'Reviews/{reviewId}',
	async (event) => {
		const snapshot = event.data;
		if (!snapshot) return;

		const review = snapshot.data() as any;
		await handleUserReview(review);
	},
);

/**
 * 사용자 차단 시 트리거
 * 양방향 차단 관계 설정
 */
export const onBlockUser = onDocumentCreated(
	'Users/{userId}/BlockedUsers/{blockedUserId}',
	async (event) => {
		const { userId, blockedUserId } = event.params;
		const snapshot = event.data;
		if (!snapshot) return;

		const { blockedAt } = snapshot.data();
		await handleUserBlocked(userId, blockedUserId, blockedAt);
	},
);

/**
 * 사용자 차단 해제 시 트리거
 * 양방향 차단 관계 해제
 */
export const onUnblockUser = onDocumentDeleted(
	'Users/{userId}/BlockedUsers/{blockedUserId}',
	async (event) => {
		const { userId, blockedUserId } = event.params;
		await handleUserUnblocked(userId, blockedUserId);
	},
);
