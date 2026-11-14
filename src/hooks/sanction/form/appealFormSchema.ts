import * as z from 'zod';

export const APPEAL_MAX_LENGTH = 1000;

// 빈 내용은 제출 버튼을 비활성화해 막으므로 별도 오류 문구를 두지 않는다
export const AppealFormSchema = z.object({
	content: z.string().trim().min(1).max(APPEAL_MAX_LENGTH),
});

export type AppealFormValues = z.infer<typeof AppealFormSchema>;
