import { Linking, StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { TextProps } from '@/types/components';

// http://, https://로 시작하는 URL만 링크로 인식한다 (www.만 있는 경우는 일반 텍스트).
// URL에 쓸 수 있는 ASCII 문자까지만 잡아 바로 뒤에 붙은 한글 조사는 링크에서 빼고,
// 문장 끝 마침표·쉼표·닫는 괄호처럼 URL 끝에 오기 어려운 문자로는 끝나지 않게 한다
const URL_PATTERN = /(https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*[A-Za-z0-9\-_~/#=&%+@])/g;

const isUrl = (segment: string) => /^https?:\/\//.test(segment);

// 잘못된 URL로 열기에 실패해도 사용자에게 알리지 않고 무시한다
const openUrl = (url: string) => {
	Linking.openURL(url).catch(() => {});
};

const LinkifiedText = ({
	children,
	...props
}: Omit<TextProps, 'children'> & { children: string }) => {
	const segments = children.split(URL_PATTERN).filter(Boolean);

	return (
		<Text {...props}>
			{segments.map((segment, index) =>
				isUrl(segment) ? (
					<Text
						key={index}
						color="primaryBrand"
						style={styles.link}
						onPress={() => openUrl(segment)}
					>
						{segment}
					</Text>
				) : (
					segment
				),
			)}
		</Text>
	);
};

const styles = StyleSheet.create({
	link: {
		textDecorationLine: 'underline',
	},
});

export default LinkifiedText;
