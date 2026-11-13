import { createContext, useContext } from 'react';
import { Text as RNText, TextStyle } from 'react-native';

import { FontWeights, TextVariants, useTheme } from '@/theme';
import { TextProps } from '@/types/components';

/** 다른 Text 안에 렌더링되는지 여부 — 중첩된 Text는 지정하지 않은 스타일을 부모에게서 상속한다 */
const NestedTextContext = createContext(false);

const Text = ({ variant, weight, color, style, ...props }: TextProps) => {
	const { colors } = useTheme();
	const isNested = useContext(NestedTextContext);

	const inheritsSize = isNested && variant === undefined;
	const variantStyle = TextVariants[variant ?? 'body1'];
	const resolvedWeight = weight ?? (inheritsSize ? undefined : variantStyle.defaultWeight);
	const resolvedColor = color ?? (isNested ? undefined : 'primary');

	const baseStyle: TextStyle = {
		...(!inheritsSize && {
			fontSize: variantStyle.fontSize,
			lineHeight: variantStyle.lineHeight,
		}),
		...(resolvedWeight && { fontWeight: FontWeights[resolvedWeight] }),
		...(resolvedColor && { color: colors.text[resolvedColor] }),
	};

	return (
		<NestedTextContext.Provider value={true}>
			<RNText style={[baseStyle, style]} {...props} />
		</NestedTextContext.Provider>
	);
};

export default Text;
