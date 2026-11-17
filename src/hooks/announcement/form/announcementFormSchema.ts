import * as z from 'zod';

import { CommonFields } from '@/hooks/post/form/newPostFormSchema';

// 제목·본문 길이 규칙과 오류 문구는 게시글 폼과 같다
export const AnnouncementFormSchema = z.object({
	...CommonFields,
	hidden: z.boolean(),
});

export type AnnouncementFormValues = z.infer<typeof AnnouncementFormSchema>;
