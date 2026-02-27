import { Feather } from '@expo/vector-icons';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FontWeights } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { Colors } from '@/theme/Color';
import { LayoutWithHeaderProps } from '@/types/components';

const { width } = Dimensions.get('window');
const isIphoneMini = width <= 375;
export const PADDING = isIphoneMini ? 18 : 24;

const LayoutWithHeader = ({
	containerStyle,
	headerCenterComponent,
	headerRightComponent,
	children,
	hasBorderBottom = true,
}: LayoutWithHeaderProps) => {
	return (
		<View style={[styles.screen, containerStyle]}>
			<View style={[styles.header, hasBorderBottom && { borderBottomWidth: 1 }]}>
				<TouchableOpacity style={styles.iconContainer} onPress={goBack}>
					<Feather name="chevron-left" size={34} color={Colors.text.primary} />
				</TouchableOpacity>
				<View style={{ flex: 1 }}>{headerCenterComponent}</View>
				<View style={{ paddingRight: 16 }}>{headerRightComponent}</View>
			</View>

			<View style={{ flex: 1 }}>{children}</View>
		</View>
	);
};

export default LayoutWithHeader;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomColor: Colors.border.default,
	},
	iconContainer: {
		padding: 5,
	},
	invalidPostContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bg.primary,
	},
	invalidPostText: {
		color: Colors.text.tertiary,
		alignSelf: 'center',
		fontWeight: FontWeights.light,
	},
});
