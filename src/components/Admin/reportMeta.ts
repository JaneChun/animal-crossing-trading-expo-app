import { REPORT_CATEGORIES } from '@/constants/post';
import { BadgeTone } from '@/types/components';
import { Report, ReportCategory } from '@/types/report';

import { ContentType } from './ContentTypeChip';

// 사기만 기존 Badge red tone, 나머지는 디자인 시안의 tone
const CATEGORY_TONES: Record<ReportCategory, BadgeTone> = {
	fraud: 'red',
	abuse: 'orange',
	spam: 'yellow',
	inappropriate: 'purple',
	other: 'neutral',
};

export const getReportCategoryBadge = (category: ReportCategory) => ({
	text: REPORT_CATEGORIES.find(({ EN }) => EN === category)?.KR ?? category,
	tone: CATEGORY_TONES[category] ?? 'neutral',
});

export const getReportContentType = (report: Report): ContentType => {
	if (report.chatId) return 'chat';
	if (report.replyId) return 'reply';
	if (report.commentId) return 'comment';
	if (report.postId) return 'post';
	return 'profile';
};
