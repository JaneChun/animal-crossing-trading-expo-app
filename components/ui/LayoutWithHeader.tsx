import { Colors } from '@/constants/Color';
import { goBack } from '@/navigation/RootNavigation';
import { LayoutWithHeaderProps } from '@/types/components';
import { Ionicons } from '@expo/vector-icons';
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const { width } = Dimensions.get('window');
const isIphoneMini = width <= 375;
export const PADDING = isIphoneMini ? 18 : 24;

const LayoutWithHeader = ({
	containerStyle,
	headerCenterComponent,
	headerRightComponent,
	children,
	hasBorderBottom = true,
	isInvalid = false,
	invalidPage,
}: LayoutWithHeaderProps) => {
	return (
		<View style={[styles.screen, containerStyle]}>
			<View
				style={[styles.header, hasBorderBottom && { borderBottomWidth: 1 }]}
			>
				<TouchableOpacity style={styles.iconContainer} onPress={goBack}>
					<Ionicons
						name='chevron-back-outline'
						size={28}
						color={Colors.font_black}
					/>
				</TouchableOpacity>
				<View style={{ flex: 1 }}>{headerCenterComponent}</View>
				<View style={{ paddingRight: 8 }}>{headerRightComponent}</View>
			</View>

			{isInvalid ? (
				invalidPage ? (
					invalidPage
				) : (
					<View style={styles.invalidPostContainer}>
						<Text style={styles.invalidPostText}>
							페이지를 찾을 수 없습니다.
						</Text>
					</View>
				)
			) : (
				<View style={{ flex: 1 }}>{children}</View>
			)}
		</View>
	);
};

export default LayoutWithHeader;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomColor: Colors.border_gray,
	},
	iconContainer: {
		padding: 5,
	},
	invalidPostContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	invalidPostText: {
		color: Colors.font_gray,
		alignSelf: 'center',
	},
});
