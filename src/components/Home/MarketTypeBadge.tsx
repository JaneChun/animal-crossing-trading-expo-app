import Badge from '@/components/ui/Badge';
import { Colors } from '@/theme/Color';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { MarketType } from '@/types/post';

const MarketTypeBadge = ({ type, containerStyle }: TypeBadgeProps<MarketType>) => {
	const marketBadgeMap: Record<MarketType, BadgeProps> = {
		sell: {
			text: '팔아요',
			textColor: Colors.text.blue,
			bgColor: Colors.bg.blue,
		},
		buy: {
			text: '구해요',
			textColor: Colors.text.green,
			bgColor: Colors.bg.green,
		},
		done: {
			text: '거래완료',
			textColor: Colors.text.tertiary,
			bgColor: Colors.bg.tertiary,
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
