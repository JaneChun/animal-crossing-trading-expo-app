import { StyleSheet, View } from 'react-native';

import { Spacing, Theme, useThemedStyles } from '@/theme';
import { LayoutProps } from '@/types/components';

import Text from '../Text';

// const { width } = Dimensions.get('window');
// const isIphoneMini = width <= 375;
// export const PADDING = isIphoneMini ? 18 : 24;
export const PADDING = 24;

const Layout = ({
	title,
	headerRightComponent,
	containerStyle,
	headerStyle,
	children,
}: LayoutProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={[styles.screen, containerStyle]}>
			{/* 헤더나 제목 등 패딩이 필요한 부분 */}
			{title && (
				<View style={[styles.header, headerStyle]}>
					<Text variant="title" style={styles.title}>
						{title}
					</Text>
					{headerRightComponent}
				</View>
			)}

			{/* 본문 영역 (스크롤 가능한 컴포넌트 포함) */}
			<View style={{ flex: 1 }}>{children}</View>
		</View>
	);
};

export default Layout;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		header: {
			paddingHorizontal: PADDING,
			paddingTop: PADDING,
			paddingBottom: PADDING / 2,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		title: {
			marginBottom: Spacing.s,
			color: colors.text.primary,
		},
	});
