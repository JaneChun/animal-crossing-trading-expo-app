import { Timestamp } from 'firebase/firestore';

import { Sanction } from '@/types/sanction';

const DAY_MS = 24 * 60 * 60 * 1000;

// 경고·영구 정지의 이의 신청 기한(조치일로부터). 기간 정지는 해제일까지
const APPEAL_WINDOW_DAYS = 30;

export const SUSPENSION_DAYS: Partial<Record<Sanction['kind'], number>> = { days7: 7, days30: 30 };

export type SanctionTargetKind = 'post' | 'comment' | 'chat';

// 댓글·답글은 사용자 화면에서 모두 '댓글'로 안내한다
export const getSanctionTargetKind = (sanction: Sanction): SanctionTargetKind | null => {
	const target = sanction.target;
	if (target?.commentId) return 'comment';
	if (target?.postId) return 'post';
	if (target?.chatId) return 'chat';
	return null;
};

// 조치 시점 스냅샷의 게시글 제목 또는 댓글·답글 본문
export const getSanctionTargetText = (sanction: Sanction): string | undefined => {
	const snapshot = sanction.target?.snapshot;
	return snapshot?.title || snapshot?.body;
};

export const isSuspended = (
	suspendUntil: Timestamp | null | undefined,
): suspendUntil is Timestamp => !!suspendUntil && suspendUntil.toMillis() > Date.now();

// 영구 정지는 Users.report.suspendUntil에 9999-12-31을 넣는다(functions/src/admin/sanction.ts의 PERMANENT_SUSPEND_UNTIL)
export const isPermanentSuspension = (suspendUntil: Timestamp): boolean =>
	suspendUntil.toDate().getUTCFullYear() >= 9999;

export const isSuspensionSanction = (sanction: Sanction) => sanction.kind !== 'warning';

// 정지 화면은 유효한 정지 조치 중 가장 최근 것을 보여 준다 (목록은 최신순)
export const findCurrentSuspension = (sanctions: Sanction[]) =>
	sanctions.find((sanction) => sanction.status === 'active' && isSuspensionSanction(sanction));

// 아직 확인하지 않은 유효한 경고 중 가장 최근 것
export const findUnacknowledgedWarning = (sanctions: Sanction[]) =>
	sanctions.find(
		(sanction) =>
			sanction.status === 'active' && sanction.kind === 'warning' && !sanction.acknowledgedAt,
	);

// functions/src/sanction/appeal.ts의 getAppealDeadline과 같은 계산
export const getAppealDeadline = (sanction: Sanction): Date => {
	if (sanction.suspendUntil) return sanction.suspendUntil.toDate();
	return new Date(sanction.createdAt.toMillis() + APPEAL_WINDOW_DAYS * DAY_MS);
};

// 유효한 조치에 아직 이의를 신청하지 않았고 기한이 남았을 때만 [이의 신청]을 보여 준다(서버도 같은 조건으로 거부)
export const canAppeal = (sanction: Sanction): boolean =>
	sanction.status === 'active' &&
	!sanction.appeal &&
	getAppealDeadline(sanction).getTime() > Date.now();
