import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { BodyProps } from '@/types/components';

const Body = ({ body, containerStyle }: BodyProps) => {
	return (
		<View style={containerStyle}>
			<Text variant="body1" color="secondary" style={styles.body}>
				{body}
			</Text>
		</View>
	);
};

export default Body;

const styles = StyleSheet.create({
	body: {
		lineHeight: 26,
	},
});
