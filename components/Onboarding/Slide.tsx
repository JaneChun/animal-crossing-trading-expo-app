import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { SlideProps } from '@/types/components';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Slide = ({ item, width, showBadge = true }: SlideProps) => {
	return (
		<View style={[styles.container, { width }]}>
			{/* 이미지 */}
			<View style={styles.imageContainer}>
				<Image source={item.image} style={styles.image} resizeMode='contain' />
			</View>

			<View style={styles.content}>
				{/* 뱃지 */}
				{showBadge && (
					<View style={styles.badgeContainer}>
						<Text style={styles.badgeText}>모동숲 마켓 사용법</Text>
					</View>
				)}

				{/* 제목 및 설명 */}
				<Text style={styles.title}>{item.title}</Text>
				<Text style={styles.description}>{item.description}</Text>
			</View>
		</View>
	);
};

export default Slide;

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
		backgroundColor: Colors.primary_background,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 50,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	badgeText: {
		color: Colors.primary_text,
		fontWeight: FontWeights.semibold,
	},
	title: {
		fontSize: FontSizes.xxl,
		fontWeight: FontWeights.bold,
		marginBottom: 16,
		color: Colors.font_black,
	},
	description: {
		fontSize: FontSizes.md,
		lineHeight: 24,
		color: Colors.font_dark_gray,
	},
});
