import { COMMUNITY_TYPES, MARKET_TYPES } from '@/constants/post';
import { CommunityType, MarketType } from '@/types/post';
import * as z from 'zod';

const CommonFields = {
	title: z
		.string()
		.min(1, '제목을 입력해주세요.')
		.max(50, '제목은 최대 50자까지 입력 가능합니다.'),
	body: z
		.string()
		.min(1, '본문을 입력해주세요.')
		.max(3000, '본문은 최대 3000자까지 입력 가능합니다.'),
};

const CartItemSchema = z.object({
	id: z.string(),
	category: z.string(),
	color: z.string().optional(),
	imageUrl: z.string(),
	name: z.string(),
	quantity: z.number(),
	price: z.number(),
});

const ImageTypeSchema = z.object({
	uri: z.string(),
});

// 🏠 마켓 폼
const MarketFormSchema = z.object({
	collectionName: z.literal('Boards'),
	type: z.enum(
		MARKET_TYPES.map((item) => item.EN) as [MarketType, ...MarketType[]],
	),
	cart: z.array(CartItemSchema),
	images: z.optional(z.never()), // 금지
	originalImageUrls: z.optional(z.never()), // 금지
	...CommonFields,
});

// 📝 커뮤니티 폼
const CommunityFormSchema = z.object({
	collectionName: z.literal('Communities'),
	type: z.enum(
		COMMUNITY_TYPES.map((item) => item.EN) as [
			CommunityType,
			...CommunityType[],
		],
	),
	images: z.array(ImageTypeSchema),
	originalImageUrls: z.array(z.string()).optional(),
	cart: z.optional(z.never()), // 금지
	...CommonFields,
});

export const NewPostFormSchema = z.discriminatedUnion('collectionName', [
	MarketFormSchema,
	CommunityFormSchema,
]);

export type NewPostFormValues = z.infer<typeof NewPostFormSchema>;
