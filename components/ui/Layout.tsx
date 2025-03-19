import { Colors } from '@/constants/Color';
import { LayoutProps } from '@/types/components';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const Layout = ({ title, children }: LayoutProps) => {
	const { width } = Dimensions.get('window');
	const isIphoneMini = width <= 375;

	return (
		<View style={[styles.screen, isIphoneMini && styles.miniScreen]}>
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
	miniScreen: {
		padding: 18,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.font_black,
	},
});
