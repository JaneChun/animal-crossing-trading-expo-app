import * as z from 'zod';

const INVALID_EMAIL_MESSAGE = '올바른 이메일 형식이 아닙니다.';

// 이메일은 공백 제거·소문자 변환 후 검증한다. 저장되는 문서 ID도 이 값이다
export const AndroidTesterFormSchema = z.object({
	email: z.string().trim().toLowerCase().email(INVALID_EMAIL_MESSAGE).max(100, INVALID_EMAIL_MESSAGE),
	agreed: z.boolean().refine((agreed) => agreed),
});

export type AndroidTesterFormValues = z.infer<typeof AndroidTesterFormSchema>;
