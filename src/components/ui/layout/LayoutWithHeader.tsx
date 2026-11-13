import { Feather } from '@expo/vector-icons';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { goBack } from '@/navigation/RootNavigation';
import { FontWeights , Spacing, Theme, useThemedStyles } from '@/theme';
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
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={[styles.screen, containerStyle]}>
			<View style={[styles.header, hasBorderBottom && { borderBottomWidth: 1 }]}>
				<TouchableOpacity style={styles.iconContainer} onPress={goBack}>
					<Feather name="chevron-left" size={34} color={styles.backIcon.color} />
				</TouchableOpacity>
				<View style={{ flex: 1 }}>{headerCenterComponent}</View>
				<View style={{ paddingRight: Spacing.l }}>{headerRightComponent}</View>
			</View>

			<View style={{ flex: 1 }}>{children}</View>
		</View>
	);
};

export default LayoutWithHeader;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			borderBottomColor: colors.border.default,
		},
		iconContainer: {
			padding: Spacing.xs,
		},
		backIcon: {
			color: colors.text.primary,
		},
		invalidPostContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.bg.primary,
		},
		invalidPostText: {
			color: colors.text.tertiary,
			alignSelf: 'center',
			fontWeight: FontWeights.light,
		},
	});
