import { Colors } from '@/constants/Color';
import { TypeBadgeProps } from '@/types/components';
import React from 'react';
import Badge from '../ui/Badge';

const TypeBadge = ({ type, containerStyle }: TypeBadgeProps) => {
	return (
		<>
			{type === 'general' && (
				<Badge
					text='자유'
					textColor={Colors.font_gray}
					bgColor={Colors.border_gray}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'giveaway' && (
				<Badge
					text='분양'
					textColor={Colors.blue_text}
					bgColor={Colors.blue_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'adopt' && (
				<Badge
					text='입양'
					textColor={Colors.green_text}
					bgColor={Colors.green_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'guide' && (
				<Badge
					text='공략/팁'
					textColor={Colors.yellow_text}
					bgColor={Colors.yellow_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'trade' && (
				<Badge
					text='만지작'
					textColor={Colors.purple_text}
					bgColor={Colors.purple_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'turnip' && (
				<Badge
					text='무 주식'
					textColor={Colors.primary_text}
					bgColor={Colors.primary_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'dream' && (
				<Badge
					text='꿈번지'
					textColor={Colors.lavendar_text}
					bgColor={Colors.lavendar_background}
					containerStyle={containerStyle}
				/>
			)}
			{type === 'design' && (
				<Badge
					text='마이디자인'
					textColor={Colors.red_text}
					bgColor={Colors.red_background}
					containerStyle={containerStyle}
				/>
			)}
		</>
	);
};

export default TypeBadge;
