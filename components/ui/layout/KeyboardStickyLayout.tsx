import React, { isValidElement, ReactNode } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardStickyLayoutProps = {
	scrollableContent: ReactNode;
	bottomContent?: ReactNode;
	containerStyle?: ViewStyle;
};

const KeyboardStickyLayout = ({
	scrollableContent,
	bottomContent,
	containerStyle,
}: KeyboardStickyLayoutProps) => {
	const insets = useSafeAreaInsets();
	const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top + 44 : 0;

	// FlatList 인지 일반 View 컴포넌트인지 확인
	const isFlatList =
		isValidElement(scrollableContent) &&
		(scrollableContent.type === FlatList ||
			scrollableContent.type === KeyboardAwareFlatList);

	return (
		<KeyboardAvoidingView
			style={[styles.screen, containerStyle]}
			behavior='padding'
			keyboardVerticalOffset={keyboardVerticalOffset}
		>
			<SafeAreaView style={styles.contentWrapper}>
				{/* 콘텐츠 */}
				{isFlatList ? (
					scrollableContent
				) : (
					<KeyboardAwareFlatList
						data={[]}
						renderItem={null}
						keyboardShouldPersistTaps='handled'
						ListHeaderComponent={() => scrollableContent}
						extraScrollHeight={16}
					/>
				)}

				{/* 인풋 */}
				<View style={styles.bottomWrapper}>{bottomContent}</View>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
};

export default KeyboardStickyLayout;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	contentWrapper: {
		flex: 1,
	},
	bottomWrapper: {},
});
