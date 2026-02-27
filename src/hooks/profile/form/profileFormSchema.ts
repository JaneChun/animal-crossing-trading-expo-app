import cenkor from 'cenkor';
import { ImagePickerAsset } from 'expo-image-picker';
import * as z from 'zod';

export const ProfileFormSchema = z.object({
	displayName: z
		.string()
		.min(1, '닉네임을 입력해주세요.')
		.max(10, '닉네임은 최대 10자까지 입력 가능합니다.')
		.regex(/^[a-zA-Z0-9가-힣]+$/, '닉네임은 띄어쓰기 없이 한글, 영문, 숫자만 가능합니다.')
		.refine((name) => !cenkor(name).filtered, {
			message: '닉네임에 부적절한 단어가 포함되어 있습니다.',
		}),
	islandName: z
		.string()
		.min(2, '섬 이름을 입력해주세요.')
		.max(10, '섬 이름은 최대 10자까지 입력 가능합니다.')
		.regex(/^[a-zA-Z0-9가-힣\s]+$/, '섬 이름은 띄어쓰기 없이 한글, 영문, 숫자만 가능합니다.')
		.refine((name) => !cenkor(name).filtered, {
			message: '섬 이름에 부적절한 단어가 포함되어 있습니다.',
		})
		.refine((value) => value.endsWith('섬') || value.endsWith('도'), {
			message: '섬 이름은 "섬" 또는 "도"로 끝나야 합니다.',
		}),
	image: z.custom<ImagePickerAsset | null>().nullable(),
	originalImageUrl: z.string(),
	fruit: z.string().optional(),
	titleFirst: z
		.string()
		.max(10, '칭호는 최대 10자까지 입력 가능합니다.')
		.regex(/^[a-zA-Z0-9가-힣 ]+$/, '올바르지 않은 문자가 포함되어 있습니다.')
		.refine((name) => !cenkor(name).filtered, {
			message: '부적절한 단어가 포함되어 있습니다.',
		})
		.optional(),
	titleLast: z
		.string()
		.max(10, '칭호는 최대 10자까지 입력 가능합니다.')
		.regex(/^[a-zA-Z0-9가-힣 ]+$/, '올바르지 않은 문자가 포함되어 있습니다.')
		.refine((name) => !cenkor(name).filtered, {
			message: '부적절한 단어가 포함되어 있습니다.',
		})
		.optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
