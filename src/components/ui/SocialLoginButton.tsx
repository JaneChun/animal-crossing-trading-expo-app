import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { SocialLoginButtonProps } from '@/types/components';
import appleImage from '@assets/images/apple.webp';
import kakaoImage from '@assets/images/kakao.png';
import kakaoRoundImage from '@assets/images/kakao_round.png';
import naverImage from '@assets/images/naver.png';
import naverRoundImage from '@assets/images/naver_round.png';

const socialImages: Record<string, number> = {
	kakao: kakaoImage,
	kakao_round: kakaoRoundImage,
	naver: naverImage,
	naver_round: naverRoundImage,
	apple: appleImage,
};

const SocialLoginButton = ({
	oauthType,
	onPress,
	round = false,
	style,
	disabled = false,
}: SocialLoginButtonProps) => {
	const key = `${oauthType}${round ? '_round' : ''}`;
	const imageSource = socialImages[key];

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={[styles.buttonContainer, { backgroundColor: Colors.social[oauthType] }, style]}
			disabled={disabled}
		>
			<FastImage
				source={imageSource}
				style={[styles.icon, oauthType === 'apple' && styles.appleIcon]}
				resizeMode={FastImage.resizeMode.contain}
			/>
			<Text
				style={[
					styles.text,
					{
						color:
							oauthType === 'naver'
								? Colors.social.naverText
								: oauthType === 'kakao'
									? Colors.social.kakaoText
									: Colors.social.appleText,
					},
				]}
			>
				{oauthType === 'naver'
					? '네이버로 로그인'
					: oauthType === 'kakao'
						? '카카오로 로그인'
						: 'Apple로 로그인'}
			</Text>
			{disabled && (
				<View style={styles.bubbleWrapper}>
					<View style={styles.bubble}>
						<Text style={styles.bubbleText}>🚀 준비중이에요!</Text>
					</View>
					<View style={styles.bubbleTriangle} />
				</View>
			)}
		</TouchableOpacity>
	);
};

export default SocialLoginButton;

const styles = StyleSheet.create({
	buttonContainer: {
		width: '100%',
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
	},
	icon: {
		position: 'absolute',
		left: 0,
		width: 36,
		height: 36,
		marginLeft: 8,
	},
	appleIcon: {
		width: 22,
		height: 22,
		marginLeft: 14,
	},
	text: {
		flex: 1,
		textAlign: 'center',
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
	},
	// ────────────────────────────────────────────────────
	// 말풍선 래퍼 (꼬리와 본체를 묶는 컨테이너)
	bubbleWrapper: {
		position: 'absolute',
		top: -16, // 버튼 바깥으로 약간 나올 수 있게 조정
		right: 8, // 원하는 위치로 조절
		alignItems: 'center',
	},
	// 풍선 본체
	bubble: {
		backgroundColor: Colors.bg.primary,
		paddingLeft: 4,
		paddingRight: 8,
		paddingVertical: 6,
		borderRadius: 10,
		// iOS 그림자
		shadowColor: Colors.bg.inverse,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		// Android elevation
		elevation: 2,
	},
	bubbleText: {
		color: '#363636',
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.regular,
	},
	// 풍선 꼬리 (삼각형)
	bubbleTriangle: {
		width: 0,
		height: 0,
		borderLeftWidth: 4,
		borderRightWidth: 4,
		borderTopWidth: 7,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderTopColor: Colors.text.inverse,
	},
});
