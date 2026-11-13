import Badge from '@/components/ui/Badge';
import { BadgeProps, TypeBadgeProps } from '@/types/components';
import { MarketType } from '@/types/post';

const marketBadgeMap: Record<MarketType, Pick<BadgeProps, 'text' | 'tone'>> = {
	sell: { text: '팔아요', tone: 'blue' },
	buy: { text: '구해요', tone: 'green' },
	done: { text: '거래완료', tone: 'neutral' },
};

const MarketTypeBadge = ({ type, containerStyle }: TypeBadgeProps<MarketType>) => {
	return (
		<>
			{type in marketBadgeMap && (
				<Badge
					text={marketBadgeMap[type].text}
					tone={marketBadgeMap[type].tone}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default MarketTypeBadge;
