import { Entypo } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import { Spacing, useTheme } from '@/theme';

const ChevronStrip = () => {
	const { colors } = useTheme();
	const chevrons = Array.from({ length: 16 });

	return (
		<View style={{ flexDirection: 'row', paddingVertical: Spacing.s }}>
			{chevrons.map((_, i) => (
				<Entypo key={i} name="chevron-thin-left" size={10} color={colors.text.tertiary} />
			))}
		</View>
	);
};

ChevronStrip.displayName = 'ChevronStrip';

export default memo(ChevronStrip);
