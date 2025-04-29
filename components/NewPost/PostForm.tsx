import { Colors } from '@/constants/Color';
import { COMMUNITY_TYPES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { PostFormProps } from '@/types/components';
import { ImageType } from '@/types/image';
import { MarketType } from '@/types/post';
import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import DropdownInput from '../ui/inputs/DropdownInput';
import { PADDING } from '../ui/layout/Layout';
import BodyInput from './BodyInput';
import ImageInput from './ImageInput';
import ItemList from './ItemList';
import TitleInput from './TitleInput';
import TypeSelect from './TypeSelect';

const PostForm = ({
	collectionName,
	flatListRef,
	handleEditItemPress,
	deleteItemFromCart,
}: PostFormProps) => {
	const { control } = useFormContext();

	const isMarket = collectionName === 'Boards';
	const isCommunity = collectionName === 'Communities';

	const dropdownOptions = COMMUNITY_TYPES.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	const isBodyFocused = useRef<boolean>(false);
	const bodyInputLayoutY = useRef<number>(0);

	return (
		<KeyboardAwareFlatList
			innerRef={(ref) => {
				flatListRef.current = ref;
			}}
			data={[]}
			renderItem={null}
			keyboardShouldPersistTaps='handled'
			ListHeaderComponent={
				<>
					{isMarket && (
						<Controller
							control={control}
							name='type'
							render={({ field: { value, onChange } }) => (
								<TypeSelect
									type={value as MarketType}
									setType={onChange}
									labelStyle={styles.label}
								/>
							)}
						/>
					)}
					{isCommunity && (
						<Controller
							control={control}
							name='type'
							render={({ field: { value, onChange } }) => (
								<View
									style={{
										width: '40%',
										flexDirection: 'row',
										marginBottom: 16,
									}}
								>
									<DropdownInput
										options={dropdownOptions}
										value={value}
										setValue={onChange}
									/>
								</View>
							)}
						/>
					)}

					{/* 제목 입력 */}
					<Controller
						control={control}
						name='title'
						render={({ field: { value, onChange } }) => (
							<TitleInput
								title={value}
								setTitle={onChange}
								containerStyle={{
									...styles.inputContainer,
									marginBottom: 0,
								}}
								inputStyle={{
									...styles.input,
									...styles.titleInput,
								}}
							/>
						)}
					/>

					{/* 본문 입력 */}
					<Controller
						control={control}
						name='body'
						render={({ field: { value, onChange } }) => (
							<BodyInput
								body={value}
								setBody={onChange}
								containerStyle={styles.inputContainer}
								inputStyle={styles.input}
								onLayout={(e) => {
									bodyInputLayoutY.current = e.nativeEvent.layout.height;
								}}
								onContentSizeChange={() => {
									if (isBodyFocused.current) {
										flatListRef.current?.scrollToOffset({
											animated: true,
											offset: Math.max(0, bodyInputLayoutY.current),
										});
									}
								}}
								onFocus={() => (isBodyFocused.current = true)}
								onBlur={() => (isBodyFocused.current = false)}
							/>
						)}
					/>

					{/* 커뮤니티용 이미지 업로드 */}
					{isCommunity && (
						<Controller
							control={control}
							name='images'
							render={({ field: { value, onChange } }) => (
								<ImageInput
									images={value.map((uri: string) => ({ uri }))}
									setImages={(images) =>
										onChange((images as ImageType[]).map((img) => img.uri))
									}
									containerStyle={{
										...styles.inputContainer,
										borderBottomWidth: 0,
									}}
									labelStyle={styles.label}
								/>
							)}
						/>
					)}

					{/* 마켓용 아이템 리스트 */}
					{isMarket && (
						<Controller
							control={control}
							name='cart'
							render={({ field: { value, onChange } }) => (
								<ItemList
									cart={value}
									handleEditItemPress={(item) => handleEditItemPress(item)}
									deleteItemFromCart={(id) => deleteItemFromCart(id)}
									containerStyle={{
										...styles.inputContainer,
										borderBottomWidth: 0,
									}}
									labelStyle={styles.label}
								/>
							)}
						/>
					)}
				</>
			}
			contentContainerStyle={{
				padding: PADDING,
			}}
		/>
	);
};

export default PostForm;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	inputContainer: {
		borderColor: Colors.border_gray,
		borderBottomWidth: 1,
		marginBottom: 16,
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
		marginBottom: 12,
	},
	input: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.regular,
	},
	titleInput: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.semibold,
		paddingVertical: 12,
	},
});
