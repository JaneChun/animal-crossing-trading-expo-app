import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { SocialLoginButtonProps } from '@/types/components';
import { OauthType } from '@/types/user';
import appleImage from '@assets/images/apple.webp';
import googleImage from '@assets/images/google.png';
import kakaoImage from '@assets/images/kakao.png';
import kakaoRoundImage from '@assets/images/kakao_round.png';
import naverImage from '@assets/images/naver.png';
import naverRoundImage from '@assets/images/naver_round.png';

import Text from './Text';

const socialImages: Record<string, number> = {
	kakao: kakaoImage,
	kakao_round: kakaoRoundImage,
	naver: naverImage,
	naver_round: naverRoundImage,
	apple: appleImage,
	google: googleImage,
};

const socialLabels: Record<OauthType, string> = {
	kakao: '카카오로 로그인',
	naver: '네이버로 로그인',
	apple: 'Apple로 로그인',
	google: 'Google로 로그인',
};

const socialTextColorKeys = {
	kakao: 'kakaoText',
	naver: 'naverText',
	apple: 'appleText',
	google: 'googleText',
} as const satisfies Record<OauthType, string>;

const SocialLoginButton = ({
	oauthType,
	onPress,
	round = false,
	style,
	disabled = false,
}: SocialLoginButtonProps) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const key = `${oauthType}${round ? '_round' : ''}`;
	const imageSource = socialImages[key];

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={[
				styles.buttonContainer,
				{ backgroundColor: colors.social[oauthType] },
				oauthType === 'apple' && styles.appleButton,
				oauthType === 'google' && styles.googleButton,
				style,
			]}
			disabled={disabled}
		>
			<FastImage
				source={imageSource}
				style={[
					styles.icon,
					oauthType === 'apple' && styles.appleIcon,
					oauthType === 'google' && styles.googleIcon,
				]}
				resizeMode={FastImage.resizeMode.contain}
			/>
			<Text
				variant="body1"
				weight="semibold"
				style={[styles.text, { color: colors.social[socialTextColorKeys[oauthType]] }]}
			>
				{socialLabels[oauthType]}
			</Text>
			{disabled && (
				<View style={styles.bubbleWrapper}>
					<View style={styles.bubble}>
						<Text variant="caption" style={styles.bubbleText}>
							🚀 준비중이에요!
						</Text>
					</View>
					<View style={styles.bubbleTriangle} />
				</View>
			)}
		</TouchableOpacity>
	);
};

export default SocialLoginButton;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		buttonContainer: {
			width: '100%',
			height: 50,
			flexDirection: 'row',
			alignItems: 'center',
			borderRadius: BorderRadius.m,
		},
		icon: {
			position: 'absolute',
			left: 0,
			width: 36,
			height: 36,
			marginLeft: Spacing.s,
		},
		appleButton: {
			borderWidth: 1,
		},
		appleIcon: {
			width: 22,
			height: 22,
			marginLeft: 14,
		},
		googleButton: {
			borderWidth: 1,
			borderColor: colors.social.googleBorder,
		},
		googleIcon: {
			width: 24,
			height: 24,
			marginLeft: 13,
		},
		text: {
			flex: 1,
			textAlign: 'center',
		},
		// ────────────────────────────────────────────────────
		// 말풍선 래퍼 (꼬리와 본체를 묶는 컨테이너)
		bubbleWrapper: {
			position: 'absolute',
			top: -16, // 버튼 바깥으로 약간 나올 수 있게 조정
			right: Spacing.s, // 원하는 위치로 조절
			alignItems: 'center',
		},
		// 풍선 본체
		bubble: {
			backgroundColor: colors.bg.primary,
			paddingLeft: Spacing.xs,
			paddingRight: Spacing.s,
			paddingVertical: 6,
			borderRadius: 10,
			// iOS 그림자
			shadowColor: colors.bg.inverse,
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.1,
			shadowRadius: 2,
			// Android elevation
			elevation: 2,
		},
		bubbleText: {
			color: colors.text.secondary,
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
			borderTopColor: colors.bg.primary,
		},
	});
