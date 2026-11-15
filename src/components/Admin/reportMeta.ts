import { REPORT_CATEGORIES } from '@/constants/post';
import { BadgeTone } from '@/types/components';
import { Report, ReportCategory } from '@/types/report';

import { ContentType } from './ContentTypeChip';

// 사기만 기존 Badge red tone, 나머지는 디자인 시안의 tone
const CATEGORY_TONES: Record<ReportCategory, BadgeTone> = {
	fraud: 'red',
	externalTrade: 'blue',
	personalInfo: 'lavender',
	abuse: 'orange',
	spam: 'yellow',
	inappropriate: 'purple',
	other: 'neutral',
};

export const getReportCategoryBadge = (category: ReportCategory) => ({
	text: REPORT_CATEGORIES.find(({ EN }) => EN === category)?.KR ?? '기타',
	tone: CATEGORY_TONES[category] ?? 'neutral',
});

// 조치 대상(SanctionTarget)도 같은 키를 가져 함께 쓴다
export const getReportContentType = (
	target: Pick<Report, 'chatId' | 'replyId' | 'commentId' | 'postId'>,
): ContentType => {
	if (target.chatId) return 'chat';
	if (target.replyId) return 'reply';
	if (target.commentId) return 'comment';
	if (target.postId) return 'post';
	return 'profile';
};
