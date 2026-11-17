import { Linking, StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { TextProps } from '@/types/components';

// http://, https://로 시작하는 URL만 링크로 인식한다 (www.만 있는 경우는 일반 텍스트)
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

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
