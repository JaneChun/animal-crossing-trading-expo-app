import { TitleProps } from '@/types/components';
import { StyleSheet, Text, View } from 'react-native';

const Title = ({ title, containerStyle }: TitleProps) => {
	return (
		<View style={containerStyle}>
			<Text style={styles.title}>{title}</Text>
		</View>
	);
};

export default Title;

const styles = StyleSheet.create({
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
});
