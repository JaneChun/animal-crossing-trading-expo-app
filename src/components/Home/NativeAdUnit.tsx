import { Image, StyleSheet, View } from 'react-native';
import { NativeAdView, NativeAsset, NativeAssetType } from 'react-native-google-mobile-ads';

import Text from '@/components/ui/Text';
import { useNativeAd } from '@/hooks/ads/useNativeAd';
import { Theme, useThemedStyles } from '@/theme';

import { POST_UNIT_MIN_HEIGHT } from './PostUnit';

const NativeAdUnit = () => {
	const styles = useThemedStyles(makeStyles);
	const { nativeAd, isLoading, error } = useNativeAd();

	if (isLoading || error || !nativeAd) {
		return null;
	}

	return (
		<NativeAdView nativeAd={nativeAd} style={styles.container}>
			<View style={styles.row}>
				{/* 텍스트 영역 */}
				<View style={styles.textArea}>
					<View style={styles.headlineRow}>
						<View style={styles.adBadge}>
							<Text variant="caption" weight="semibold" color="secondary">
								광고
							</Text>
						</View>
						<NativeAsset assetType={NativeAssetType.HEADLINE}>
							<Text
								variant="body2"
								weight="semibold"
								style={styles.headline}
								numberOfLines={1}
							>
								{nativeAd.headline}
							</Text>
						</NativeAsset>
					</View>

					<NativeAsset assetType={NativeAssetType.BODY}>
						<Text variant="caption" color="secondary" numberOfLines={1}>
							{nativeAd.body}
						</Text>
					</NativeAsset>

					<View style={styles.meta}>
						{nativeAd.advertiser && (
							<NativeAsset assetType={NativeAssetType.ADVERTISER}>
								<Text
									variant="micro"
									weight="regular"
									color="tertiary"
									style={styles.advertiser}
									numberOfLines={1}
								>
									{nativeAd.advertiser}
								</Text>
							</NativeAsset>
						)}
						{nativeAd.starRating !== null && nativeAd.starRating !== undefined && (
							<NativeAsset assetType={NativeAssetType.STAR_RATING}>
								<Text variant="micro" weight="regular" color="yellow">
									{'★'.repeat(
										Math.max(0, Math.min(5, Math.round(nativeAd.starRating))),
									)}
								</Text>
							</NativeAsset>
						)}
					</View>
				</View>

				{/* 아이콘 */}
				{nativeAd.icon?.url && (
					<NativeAsset assetType={NativeAssetType.ICON}>
						<Image source={{ uri: nativeAd.icon.url }} style={styles.thumbnail} />
					</NativeAsset>
				)}
			</View>
		</NativeAdView>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		minHeight: POST_UNIT_MIN_HEIGHT,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.border.default,
		backgroundColor: colors.bg.primary,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	thumbnail: {
		width: 50,
		height: 50,
		borderRadius: 6,
		resizeMode: 'cover',
		borderWidth: 1,
		borderColor: colors.border.default,
	},
	textArea: {
		flex: 1,
		gap: 6,
	},
	headlineRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	adBadge: {
		backgroundColor: colors.bg.primary,
		borderWidth: 1,
		borderColor: colors.border.default,
		paddingVertical: 4,
		paddingHorizontal: 5,
		borderRadius: 4,
	},
	headline: {
		flex: 1,
	},
	meta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	advertiser: {
		flexShrink: 1,
	},
});

export default NativeAdUnit;
