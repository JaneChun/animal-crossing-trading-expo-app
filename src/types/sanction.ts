import { DocumentData, Timestamp } from 'firebase/firestore';

import { SANCTION_KINDS, VIOLATION_TYPES } from '@/constants/sanction';

import { ReportTarget } from './report';

export type ViolationType = (typeof VIOLATION_TYPES)[number]['EN'];
export type ViolationSeverity = (typeof VIOLATION_TYPES)[number]['severity'];
export type SanctionKind = (typeof SANCTION_KINDS)[number]['EN'];

// 만료(조치일 + 90일)는 저장하지 않고 createdAt으로 계산한다
export type SanctionStatus = 'active' | 'canceled';

export type AppealStatus = 'pending' | 'reviewed';
export type AppealResult = 'upheld' | 'canceled';

// 위반 대상 콘텐츠. 채팅 위반이면 chatId만 있고 숨김 대상이 없다
export type SanctionTarget = Omit<ReportTarget, 'reporteeId'> & {
	snapshot?: DocumentData; // 조치 시점의 게시글·댓글·답글 문서 (원본이 삭제돼도 제목을 보여 준다)
};

export interface Appeal {
	content: string; // 1000자 이내
	status: AppealStatus;
	createdAt: Timestamp;
	result?: AppealResult; // 검토 완료 시
	reply?: string; // 운영자 답변
	repliedAt?: Timestamp;
}

export interface Sanction {
	id: string;
	userId: string; // 조치 대상 유저 UID
	kind: SanctionKind;
	violationType: ViolationType;
	target?: SanctionTarget; // 프로필 등 대상 콘텐츠가 없으면 생략
	reportIds: string[]; // 근거 신고
	adminId: string; // 처리 관리자 UID
	status: SanctionStatus;
	createdAt: Timestamp;
	suspendUntil: Timestamp | null; // 기간 정지의 해제 예정일. 경고·영구 정지는 null
	appeal?: Appeal; // 조치 1건당 1개
}

export type IssueSanctionRequest = Pick<Sanction, 'userId' | 'kind' | 'violationType' | 'reportIds'> & {
	target?: Omit<SanctionTarget, 'snapshot'>;
};
