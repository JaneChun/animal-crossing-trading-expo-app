import { View } from 'react-native';

import Text from '@/components/ui/Text';
import { TitleProps } from '@/types/components';

const Title = ({ title, containerStyle }: TitleProps) => {
	return (
		<View style={containerStyle}>
			<Text variant="title" weight="semibold">
				{title}
			</Text>
		</View>
	);
};

export default Title;
