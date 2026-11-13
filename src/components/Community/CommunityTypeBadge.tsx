import Badge from '@/components/ui/Badge';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { CommunityType } from '@/types/post';

const communityTypeBadgeMap: Record<CommunityType, Pick<BadgeProps, 'text' | 'tone'>> = {
	general: { text: '자유', tone: 'neutral' },
	giveaway: { text: '분양', tone: 'blue' },
	adopt: { text: '입양', tone: 'green' },
	guide: { text: '공략/팁', tone: 'yellow' },
	trade: { text: '만지작', tone: 'purple' },
	turnip: { text: '무 주식', tone: 'brand' },
	dream: { text: '꿈번지', tone: 'lavender' },
	design: { text: '마이디자인', tone: 'red' },
	parttime: { text: '알바', tone: 'orange' },
};

const CommunityTypeBadge = ({ type, containerStyle }: TypeBadgeProps<CommunityType>) => {
	return (
		<>
			{type in communityTypeBadgeMap && (
				<Badge
					text={communityTypeBadgeMap[type].text}
					tone={communityTypeBadgeMap[type].tone}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default CommunityTypeBadge;
