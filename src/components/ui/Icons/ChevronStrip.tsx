import { Entypo } from '@expo/vector-icons';
import { memo } from 'react';
import { View } from 'react-native';

import { Colors } from '@/theme';

const ChevronStrip = () => {
	const chevrons = Array.from({ length: 16 });

	return (
		<View style={{ flexDirection: 'row', paddingVertical: 8 }}>
			{chevrons.map((_, i) => (
				<Entypo key={i} name="chevron-thin-left" size={10} color={Colors.text.tertiary} />
			))}
		</View>
	);
};

ChevronStrip.displayName = 'ChevronStrip';

export default memo(ChevronStrip);
