import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useKeyboardHeight = () => {
	const insets = useSafeAreaInsets();

	const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

	useEffect(() => {
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const onKeyboardShow = (e: any) => {
			const finalHeight =
				e.endCoordinates.height - (Platform.OS === 'ios' ? insets.bottom : 0);
			setKeyboardHeight(finalHeight);
		};

		const onKeyboardHide = () => {
			setKeyboardHeight(0);
		};

		const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
		const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, [insets.bottom]);

	return keyboardHeight;
};
