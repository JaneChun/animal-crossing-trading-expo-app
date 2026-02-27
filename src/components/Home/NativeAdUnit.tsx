import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeAdView, NativeAsset, NativeAssetType } from 'react-native-google-mobile-ads';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { useNativeAd } from '@/hooks/ads/useNativeAd';
import { Colors } from '@/theme/Color';
import { POST_UNIT_HEIGHT } from './PostUnit';

const NativeAdUnit = () => {
	const { nativeAd, isLoading, error } = useNativeAd();

	if (isLoading || error || !nativeAd) {
		return <View style={styles.container} />;
	}

	return (
		<NativeAdView nativeAd={nativeAd} style={styles.container}>
			<View style={styles.row}>
				{/* 텍스트 영역 */}
				<View style={styles.textArea}>
					<View style={styles.headlineRow}>
						<View style={styles.adBadge}>
							<Text style={styles.adBadgeText}>광고</Text>
						</View>
						<NativeAsset assetType={NativeAssetType.HEADLINE}>
							<Text style={styles.headline} numberOfLines={1}>
								{nativeAd.headline}
							</Text>
						</NativeAsset>
					</View>

					<NativeAsset assetType={NativeAssetType.BODY}>
						<Text style={styles.body} numberOfLines={1}>
							{nativeAd.body}
						</Text>
					</NativeAsset>

					<View style={styles.meta}>
						{nativeAd.advertiser && (
							<NativeAsset assetType={NativeAssetType.ADVERTISER}>
								<Text style={styles.advertiser} numberOfLines={1}>
									{nativeAd.advertiser}
								</Text>
							</NativeAsset>
						)}
						{nativeAd.starRating !== null && nativeAd.starRating !== undefined && (
							<NativeAsset assetType={NativeAssetType.STAR_RATING}>
								<Text style={styles.starRating}>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		height: POST_UNIT_HEIGHT,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
		backgroundColor: Colors.bg.primary,
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
		borderColor: Colors.border.default,
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
		backgroundColor: Colors.bg.primary,
		borderWidth: 1,
		borderColor: Colors.border.default,
		paddingVertical: 4,
		paddingHorizontal: 5,
		borderRadius: 4,
	},
	adBadgeText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.text.secondary,
	},
	headline: {
		flex: 1,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.text.primary,
	},
	body: {
		fontSize: FontSizes.xs,
		color: Colors.text.secondary,
	},
	meta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	advertiser: {
		fontSize: FontSizes.xxs,
		color: Colors.text.tertiary,
		flexShrink: 1,
	},
	starRating: {
		fontSize: FontSizes.xxs,
		color: '#ffcc26ff',
	},
});

export default NativeAdUnit;
