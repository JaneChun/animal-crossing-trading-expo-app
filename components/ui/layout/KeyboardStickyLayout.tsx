import { useKeyboardHeight } from '@/hooks/shared/useKeyboardHeight';
import React, { isValidElement, ReactNode, RefObject } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardStickyLayoutProps = {
	scrollableContent: ReactNode;
	bottomContent?: ReactNode;
	containerStyle?: ViewStyle;
	scrollableContentRef: RefObject<any>;
};

const KeyboardStickyLayout = ({
	scrollableContent,
	bottomContent,
	containerStyle,
	scrollableContentRef,
}: KeyboardStickyLayoutProps) => {
	const insets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();

	// FlatList 인지 일반 View 컴포넌트인지 확인
	const isFlatList =
		isValidElement(scrollableContent) &&
		(scrollableContent.type === FlatList ||
			scrollableContent.type === KeyboardAwareFlatList);

	return (
		<View
			style={[
				styles.screen,
				containerStyle,
				{ paddingBottom: keyboardHeight + insets.bottom },
			]}
		>
			{/* 스크롤 콘텐츠 영역 */}
			{isFlatList ? (
				scrollableContent
			) : (
				<KeyboardAwareFlatList
					ref={scrollableContentRef}
					data={[]}
					renderItem={null}
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={{ flexGrow: 1 }}
					ListHeaderComponent={() => scrollableContent}
					enableAutomaticScroll={false}
				/>
			)}

			{/* 하단 입력 영역 */}
			{bottomContent}
		</View>
	);
};

export default KeyboardStickyLayout;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
});
