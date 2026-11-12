import { StyleSheet, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { SlideProps } from '@/types/components';

const Slide = ({ item, width, showBadge = true }: SlideProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={[styles.container, { width }]}>
			{/* 이미지 */}
			<View style={styles.imageContainer}>
				<ImageWithFallback
					localSource={item.image}
					style={styles.image}
					resizeMode="contain"
				/>
			</View>

			<View style={styles.content}>
				{/* 뱃지 */}
				{showBadge && (
					<View style={styles.badgeContainer}>
						<Text variant="body2" weight="semibold" color="primaryBrand">
							모동숲 마켓 사용법
						</Text>
					</View>
				)}

				{/* 제목 및 설명 */}
				<Text variant="display" style={styles.title}>
					{item.title}
				</Text>
				<Text variant="body1" color="secondary">
					{item.description}
				</Text>
			</View>
		</View>
	);
};

export default Slide;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 24,
		},
		imageContainer: {
			flex: 1,
		},
		image: {
			width: '100%',
			height: '100%',
		},
		content: {
			paddingHorizontal: 18,
			paddingVertical: 18,
		},
		badgeContainer: {
			backgroundColor: colors.bg.primaryBrand,
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 50,
			alignSelf: 'flex-start',
			marginBottom: 12,
		},
		title: {
			marginBottom: 16,
		},
	});
