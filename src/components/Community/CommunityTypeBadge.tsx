import Badge from '@/components/ui/Badge';
import { Colors } from '@/theme/Color';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { CommunityType } from '@/types/post';

const CommunityTypeBadge = ({ type, containerStyle }: TypeBadgeProps<CommunityType>) => {
	const communityTypeBadgeMap: Record<CommunityType, BadgeProps> = {
		general: {
			text: '자유',
			textColor: Colors.text.tertiary,
			bgColor: Colors.bg.tertiary,
		},
		giveaway: {
			text: '분양',
			textColor: Colors.text.blue,
			bgColor: Colors.bg.blue,
		},
		adopt: {
			text: '입양',
			textColor: Colors.text.green,
			bgColor: Colors.bg.green,
		},
		guide: {
			text: '공략/팁',
			textColor: Colors.text.yellow,
			bgColor: Colors.bg.yellow,
		},
		trade: {
			text: '만지작',
			textColor: Colors.text.purple,
			bgColor: Colors.bg.purple,
		},
		turnip: {
			text: '무 주식',
			textColor: Colors.text.primaryBrand,
			bgColor: Colors.bg.primaryBrand,
		},
		dream: {
			text: '꿈번지',
			textColor: Colors.text.lavender,
			bgColor: Colors.bg.lavender,
		},
		design: {
			text: '마이디자인',
			textColor: Colors.text.red,
			bgColor: Colors.bg.red,
		},
		parttime: {
			text: '알바',
			textColor: Colors.text.orange,
			bgColor: Colors.bg.orange,
		},
	};

	return (
		<>
			{type in communityTypeBadgeMap && (
				<Badge
					text={communityTypeBadgeMap[type].text}
					textColor={communityTypeBadgeMap[type].textColor}
					bgColor={communityTypeBadgeMap[type].bgColor}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default CommunityTypeBadge;
