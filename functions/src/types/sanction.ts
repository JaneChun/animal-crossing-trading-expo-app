// 앱 src/types/sanction.ts와 같은 구조 (Sanctions 컬렉션 문서)

export type ViolationType =
	| 'fraud'
	| 'externalTrade'
	| 'personalInfo'
	| 'abuse'
	| 'inappropriate'
	| 'spam';

export type SanctionKind = 'warning' | 'days7' | 'days30' | 'permanent';

export type SanctionStatus = 'active' | 'canceled';

export type AppealStatus = 'pending' | 'reviewed';
export type AppealResult = 'upheld' | 'canceled';

export interface SanctionTarget {
	collectionName?: string;
	postId?: string;
	commentId?: string;
	replyId?: string;
	chatId?: string;
	snapshot?: FirebaseFirestore.DocumentData;
}

export interface Appeal {
	content: string;
	status: AppealStatus;
	createdAt: FirebaseFirestore.Timestamp;
	result?: AppealResult;
	reply?: string;
	repliedAt?: FirebaseFirestore.Timestamp;
}

export interface SanctionDoc {
	userId: string;
	kind: SanctionKind;
	violationType: ViolationType;
	target?: SanctionTarget;
	reportIds: string[];
	adminId: string;
	status: SanctionStatus;
	createdAt: FirebaseFirestore.Timestamp;
	suspendUntil: FirebaseFirestore.Timestamp | null;
	appeal?: Appeal;
	acknowledgedAt?: FirebaseFirestore.Timestamp;
}

export interface IssueSanctionRequest {
	userId: string;
	kind: SanctionKind;
	violationType: ViolationType;
	reportIds?: string[];
	target?: Omit<SanctionTarget, 'snapshot'>;
}
