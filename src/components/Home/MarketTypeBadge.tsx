import { Colors } from '@/constants/Color';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { MarketType } from '@/types/post';
import React from 'react';
import Badge from '../ui/Badge';

const MarketTypeBadge = ({
	type,
	containerStyle,
}: TypeBadgeProps<MarketType>) => {
	const marketBadgeMap: Record<MarketType, BadgeProps> = {
		sell: {
			text: '팔아요',
			textColor: Colors.blue_text,
			bgColor: Colors.blue_background,
		},
		buy: {
			text: '구해요',
			textColor: Colors.green_text,
			bgColor: Colors.green_background,
		},
		done: {
			text: '거래완료',
			textColor: Colors.font_gray,
			bgColor: Colors.border_gray,
		},
	};
	return (
		<>
			{type in marketBadgeMap && (
				<Badge
					text={marketBadgeMap[type].text}
					textColor={marketBadgeMap[type].textColor}
					bgColor={marketBadgeMap[type].bgColor}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default MarketTypeBadge;
