import { Text, StyleSheet, ViewStyle, View } from 'react-native';

type TitleProps = {
	title: string;
	containerStyle: ViewStyle;
};
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
