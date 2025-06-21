import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { SocialLoginButtonProp } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';

const socialImages: Record<string, any> = {
	kakao: require('../../assets/images/kakao.png'),
	kakao_round: require('../../assets/images/kakao_round.png'),
	naver: require('../../assets/images/naver.png'),
	naver_round: require('../../assets/images/naver_round.png'),
};

const SocialLoginButton = ({
	oauthType,
	onPress,
	round = false,
	style,
}: SocialLoginButtonProp) => {
	const key = `${oauthType}${round ? '_round' : ''}`;
	const imageSource = socialImages[key];

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={[
				styles.buttonContainer,
				{ backgroundColor: Colors[oauthType] },
				style,
			]}
		>
			<FastImage
				source={imageSource}
				style={styles.icon}
				resizeMode={FastImage.resizeMode.contain}
			/>
			<Text
				style={[
					styles.text,
					{ color: oauthType === 'naver' ? 'white' : Colors.kakao_text },
				]}
			>
				{oauthType === 'naver' ? '네이버 로그인' : '카카오 로그인'}
			</Text>
		</TouchableOpacity>
	);
};

export default SocialLoginButton;

const styles = StyleSheet.create({
	buttonContainer: {
		width: '100%',
		height: 45,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 8,
	},
	icon: {
		position: 'absolute',
		left: 0,
		width: 40,
		height: 40,
		marginLeft: 8,
	},
	text: {
		flex: 1,
		textAlign: 'center',
		fontSize: FontSizes.md,
	},
});
