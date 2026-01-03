import { Colors } from '@/constants/Color';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { CommunityType } from '@/types/post';
import React from 'react';
import Badge from '@/components/ui/Badge';

const CommunityTypeBadge = ({
	type,
	containerStyle,
}: TypeBadgeProps<CommunityType>) => {
	const communityTypeBadgeMap: Record<CommunityType, BadgeProps> = {
		general: {
			text: '자유',
			textColor: Colors.font_gray,
			bgColor: Colors.border_gray,
		},
		giveaway: {
			text: '분양',
			textColor: Colors.blue_text,
			bgColor: Colors.blue_background,
		},
		adopt: {
			text: '입양',
			textColor: Colors.green_text,
			bgColor: Colors.green_background,
		},
		guide: {
			text: '공략/팁',
			textColor: Colors.yellow_text,
			bgColor: Colors.yellow_background,
		},
		trade: {
			text: '만지작',
			textColor: Colors.purple_text,
			bgColor: Colors.purple_background,
		},
		turnip: {
			text: '무 주식',
			textColor: Colors.primary_text,
			bgColor: Colors.primary_background,
		},
		dream: {
			text: '꿈번지',
			textColor: Colors.lavendar_text,
			bgColor: Colors.lavendar_background,
		},
		design: {
			text: '마이디자인',
			textColor: Colors.red_text,
			bgColor: Colors.red_background,
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
