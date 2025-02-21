import { Colors } from '@/constants/Color';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Layout = ({
	title,
	children,
}: {
	title?: string;
	children: ReactNode;
}) => {
	return (
		<View style={styles.screen}>
			{title && <Text style={styles.title}>{title}</Text>}
			{children}
		</View>
	);
};

export default Layout;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		padding: 24,
		backgroundColor: 'white',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.font_black,
	},
});
