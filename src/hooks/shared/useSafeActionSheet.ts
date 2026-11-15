import { ActionSheetOptions, useActionSheet } from '@expo/react-native-action-sheet';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Android 커스텀 액션 시트는 화면 하단에 붙어 내비게이션 바에 가려지므로 하단 inset만큼 여백을 둔다.
// iOS는 네이티브 ActionSheetIOS를 써서 containerStyle이 적용되지 않는다.
const useSafeActionSheet = () => {
	const { showActionSheetWithOptions } = useActionSheet();
	const insets = useSafeAreaInsets();

	const showSafeActionSheet = (
		options: ActionSheetOptions,
		callback: (i?: number) => void | Promise<void>,
	) => {
		showActionSheetWithOptions(
			Platform.OS === 'android'
				? {
						...options,
						containerStyle: { ...options.containerStyle, paddingBottom: insets.bottom },
					}
				: options,
			callback,
		);
	};

	return { showActionSheetWithOptions: showSafeActionSheet };
};

export default useSafeActionSheet;
