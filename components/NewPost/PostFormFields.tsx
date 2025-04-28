import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import ItemList from '@/components/NewPost/ItemList';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import DropdownInput from '@/components/ui/inputs/DropdownInput';
import { Colors } from '@/constants/Color';
import { COMMUNITY_TYPES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { PostFormFieldsProps } from '@/types/components';
import { MarketType } from '@/types/post';
import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';

const PostFormFields = ({
	form,
	isSubmitted,
	handleEditItemPress,
	deleteItemFromCart,
}: PostFormFieldsProps) => {
	const { collectionName } = usePostContext();

	const isMarket = collectionName === 'Boards';
	const isCommunity = collectionName === 'Communities';

	const dropdownOptions = COMMUNITY_TYPES.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	const {
		type,
		setType,
		title,
		setTitle,
		body,
		setBody,
		images,
		setImages,
		cart,
		setCart,
	} = form;

	return (
		<>
			{isMarket && (
				<TypeSelect
					type={type as MarketType}
					setType={setType as Dispatch<SetStateAction<MarketType>>}
					labelStyle={styles.label}
				/>
			)}
			{isCommunity && (
				<View style={{ width: '40%', flexDirection: 'row', marginBottom: 16 }}>
					<DropdownInput
						options={dropdownOptions}
						value={type}
						setValue={setType as Dispatch<SetStateAction<string>>}
					/>
				</View>
			)}

			<TitleInput
				title={title}
				setTitle={setTitle}
				containerStyle={{
					...styles.inputContainer,
					marginBottom: 0,
				}}
				inputStyle={{
					...styles.input,
					...styles.titleInput,
				}}
				isSubmitted={isSubmitted}
			/>

			<BodyInput
				body={body}
				setBody={setBody}
				containerStyle={styles.inputContainer}
				inputStyle={styles.input}
				isSubmitted={isSubmitted}
			/>

			{isCommunity && (
				<ImageInput
					images={images}
					setImages={setImages}
					containerStyle={{ ...styles.inputContainer, borderBottomWidth: 0 }}
					labelStyle={styles.label}
				/>
			)}

			{isMarket && (
				<ItemList
					cart={cart}
					handleEditItemPress={handleEditItemPress}
					deleteItemFromCart={deleteItemFromCart}
					containerStyle={{ ...styles.inputContainer, borderBottomWidth: 0 }}
					labelStyle={styles.label}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
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

export default PostFormFields;
