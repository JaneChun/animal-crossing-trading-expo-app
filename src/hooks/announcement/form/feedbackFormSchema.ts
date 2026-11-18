import * as z from 'zod';

export const FeedbackFormSchema = z.object({
	body: z
		.string()
		.trim()
		.min(1, '의견을 입력해주세요.')
		.max(1000, '의견은 최대 1000자까지 입력 가능합니다.'),
});

export type FeedbackFormValues = z.infer<typeof FeedbackFormSchema>;
