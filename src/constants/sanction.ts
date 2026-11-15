// 위반 유형. severity는 관리자 화면 전용(권장 조치 계산), 사용자에게 노출하지 않는다
export const VIOLATION_TYPES = [
	{ KR: '사기', EN: 'fraud', severity: 'high' },
	{ KR: '현금·외부 거래', EN: 'externalTrade', severity: 'high' },
	{ KR: '개인정보·외부 연락 유도', EN: 'personalInfo', severity: 'high' },
	{ KR: '욕설/비방', EN: 'abuse', severity: 'medium' },
	{ KR: '음란/부적절 콘텐츠', EN: 'inappropriate', severity: 'medium' },
	{ KR: '광고/도배', EN: 'spam', severity: 'low' },
] as const;

export const SANCTION_KINDS = [
	{ KR: '경고', EN: 'warning' },
	{ KR: '7일 정지', EN: 'days7' },
	{ KR: '30일 정지', EN: 'days30' },
	{ KR: '영구 정지', EN: 'permanent' },
] as const;

// 관리자 신고·조치 관리의 조치 단계 (탭 라벨). 단계 이동은 Functions가 한다
export const SANCTION_REVIEW_STAGES = [
	{ KR: '확인 대기', EN: 'awaitingUser' },
	{ KR: '답변 필요', EN: 'awaitingReply' },
	{ KR: '처리 완료', EN: 'done' },
] as const;

type ViolationTypeValue = (typeof VIOLATION_TYPES)[number]['EN'];

type PolicyExample = {
	allowed: boolean;
	text: string;
	sub?: string;
};

type ViolationPolicy = {
	description: string;
	examples: PolicyExample[];
};

// 운영 정책 페이지와 경고 화면에서 함께 쓰는 사용자용 문구 (시안 '운영 정책 (사용자 · 관리자 공용)')
export const VIOLATION_POLICIES: Record<ViolationTypeValue, ViolationPolicy> = {
	fraud: {
		description: '거래 상대를 속여 손해를 입히는 행위는 금지됩니다.',
		examples: [
			{ allowed: false, text: '마일이나 아이템을 먼저 받고 거래를 이행하지 않기' },
			{ allowed: false, text: '받은 뒤 상대를 차단하고 사라지기' },
			{ allowed: true, text: '채팅에서 약속한 시간에 만나 약속한 내용대로 주고받기' },
		],
	},
	externalTrade: {
		description:
			'모동숲 마켓에서는 게임 아이템끼리만 거래할 수 있습니다.\n사기 피해를 막기 위해 현금이나 게임 밖의 재화와 거래할 수 없습니다.',
		examples: [
			{ allowed: false, text: '마일티켓을 원화로 판매' },
			{ allowed: false, text: '게임 밖의 물건이나 서비스를 아이템과 교환' },
			{ allowed: true, text: '아이템, 마일티켓, 벨 등 게임 아이템끼리 교환' },
		],
	},
	personalInfo: {
		description:
			'잘 모르는 상대에게 연락처를 알려 주거나 요구하지 마세요. 거래를 위한 대화는 앱 내 채팅으로 충분합니다.',
		examples: [
			{ allowed: false, text: '전화번호나 SNS 아이디 게시' },
			{ allowed: false, text: '전화나 외부 메신저로 대화 유도' },
			{ allowed: true, text: '앱 내 채팅으로 거래 약속 잡기' },
		],
	},
	abuse: {
		description: '모두가 즐겁게 거래할 수 있도록 서로 존중해 주세요.',
		examples: [
			{ allowed: false, text: '욕설, 비하, 인신공격' },
			{ allowed: false, text: '특정 사용자를 저격하는 글' },
			{
				allowed: true,
				text: '불편한 사용자는 신고하거나 차단하기',
				sub: '차단한 사용자의 게시글은 보이지 않고, 그 사용자는 나에게 댓글과 채팅을 보낼 수 없습니다.',
			},
		],
	},
	inappropriate: {
		description:
			'모든 사용자가 볼 수 있는 공간입니다. 다른 사람에게 불쾌감을 줄 수 있는 글과 이미지는 올리지 말아 주세요.',
		examples: [
			{ allowed: false, text: '음란물 게시' },
			{ allowed: false, text: '폭력·혐오 표현' },
		],
	},
	spam: {
		description:
			'반복 게시와 홍보 글은 다른 사용자가 원하는 거래 글을 찾기 어렵게 만듭니다. 앱과 관계없는 광고나 홍보는 금지됩니다.',
		examples: [
			{ allowed: false, text: '같은 글 반복 게시' },
			{ allowed: false, text: '앱과 관계없는 홍보' },
		],
	},
};
