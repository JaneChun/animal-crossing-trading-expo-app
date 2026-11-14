import { StyleSheet, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { BorderRadius, Theme, useThemedStyles } from '@/theme';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

type AvatarPairProps = {
	photoURLs: [string | undefined, string | undefined];
	size?: number;
};

// 채팅 참여자 두 명의 겹친 아바타
const AvatarPair = ({ photoURLs, size = 32 }: AvatarPairProps) => {
	const styles = useThemedStyles(makeStyles);
	const sizeStyle = { width: size, height: size };

	return (
		<View style={styles.pair}>
			{photoURLs.map((uri, index) => (
				<ImageWithFallback
					key={index}
					uri={uri}
					fallbackSource={emptyProfileImage}
					style={[styles.avatar, sizeStyle, index > 0 && { marginLeft: -size / 3 }]}
				/>
			))}
		</View>
	);
};

export default AvatarPair;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		pair: {
			flexDirection: 'row',
			flexShrink: 0,
		},
		avatar: {
			borderRadius: BorderRadius.full,
			borderWidth: 2,
			borderColor: colors.bg.fill,
		},
	});
