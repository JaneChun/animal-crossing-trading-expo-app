import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { AddImageButtonProps } from '@/types/components';

import Text from './Text';

const AddImageButton = ({ count, totalCount, onPress, isLoading }: AddImageButtonProps) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[styles.addImageButtonContainer, styles.imageContainer]}
			activeOpacity={0.5}
			onPress={onPress}
			disabled={isLoading}
		>
			{isLoading ? (
				<>
					<ActivityIndicator color={colors.text.tertiary} size="large" />
					<View style={styles.textContainer}>
						<Text variant="body2" style={styles.totalCountText}>
							업로드중...
						</Text>
					</View>
				</>
			) : (
				<>
					<MaterialIcons name="photo-library" color={colors.text.tertiary} size={48} />
					<View style={styles.textContainer}>
						<Text variant="body2" style={styles.currentCountText}>
							{count}
						</Text>
						<Text variant="body2" style={styles.totalCountText}>
							{' '}
							/ {totalCount}
						</Text>
					</View>
				</>
			)}
		</TouchableOpacity>
	);
};

export default AddImageButton;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		imageContainer: {
			width: 100,
			height: 100,
			margin: 6,
			borderRadius: BorderRadius.m,
		},
		addImageButtonContainer: {
			padding: Spacing.s,
			backgroundColor: colors.bg.secondary,
			borderWidth: 1,
			borderColor: colors.border.default,
			justifyContent: 'center',
			alignItems: 'center',
		},
		textContainer: {
			fontSize: 14,
			flexDirection: 'row',
			marginTop: Spacing.xs,
		},
		currentCountText: {
			color: colors.brand.primary,
			fontWeight: 'bold',
		},
		totalCountText: {
			color: colors.text.tertiary,
			fontWeight: 'semibold',
		},
	});
