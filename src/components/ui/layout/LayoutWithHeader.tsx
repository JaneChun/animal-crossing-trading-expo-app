import { Feather } from '@expo/vector-icons';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { goBack } from '@/navigation/RootNavigation';
import { FontWeights , Spacing, Theme, useThemedStyles } from '@/theme';
import { LayoutWithHeaderProps } from '@/types/components';

const { width } = Dimensions.get('window');
const isIphoneMini = width <= 375;
export const PADDING = isIphoneMini ? 18 : 24;
// 헤더(뒤로가기 줄) 높이: 아이콘 34 + 상하 패딩 8 + 아래 테두리 1에 아이콘 글리프 여백이 더해져 실측 약 44.
// 헤더 아래 콘텐츠의 키보드 offset 계산에 쓴다. 헤더 스타일을 바꾸면 이 값도 다시 잰다
export const LAYOUT_HEADER_HEIGHT = 44;

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
