import { Colors } from '@/constants/Color';
import { TypeBadgeProps } from '@/types/components';
import React from 'react';
import Badge from '../ui/Badge';

const TypeBadge = ({ type, containerStyle }: TypeBadgeProps) => {
	return (
		<>
			{type === 'sell' ? (
				<Badge
					text='팔아요'
					textColor={Colors.blue_text}
					bgColor={Colors.blue_background}
					containerStyle={containerStyle}
				/>
			) : (
				<Badge
					text='구해요'
					textColor={Colors.green_text}
					bgColor={Colors.green_background}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default TypeBadge;
