import { View } from 'react-native';

import Text from '@/components/ui/Text';
import { CreatedAtProps } from '@/types/components';
import { elapsedTime } from '@/utilities/elapsedTime';

const CreatedAt = ({ createdAt, containerStyle }: CreatedAtProps) => {
	return (
		<View style={containerStyle}>
			<Text variant="caption" color="tertiary">
				{elapsedTime(createdAt)}
			</Text>
		</View>
	);
};

export default CreatedAt;
