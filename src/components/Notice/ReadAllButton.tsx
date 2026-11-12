import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Text from '@/components/ui/Text';

const ReadAllButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={onPress}>
				<Text variant="caption" color="tertiary">
					모두 읽음
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default ReadAllButton;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
});
