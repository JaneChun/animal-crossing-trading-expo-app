import { HighlightMatchProps } from '@/types/components';
import React from 'react';
import { Text } from 'react-native';

const HighlightMatchText = ({
	text,
	keyword,
	textStyle,
	highlightTextStyle,
}: HighlightMatchProps) => {
	if (!keyword?.trim()) {
		return <Text style={textStyle}>{text}</Text>;
	}

	const regex = new RegExp(`(${keyword})`, 'gi');
	const parts = text.split(regex);

	return parts.map((part, index) =>
		part.toLowerCase() === keyword.toLowerCase() ? (
			<Text key={index} style={highlightTextStyle}>
				{part}
			</Text>
		) : (
			<Text key={index} style={textStyle}>
				{part}
			</Text>
		),
	);
};

export default HighlightMatchText;
