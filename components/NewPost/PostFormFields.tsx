import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import ItemList from '@/components/NewPost/ItemList';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import DropdownInput from '@/components/ui/inputs/DropdownInput';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { PostFormFieldsProps } from '@/types/components';
import { MarketType } from '@/types/post';
import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';

const PostFormFields = ({
	form,
	isSubmitted,
	dropdownOptions,
}: PostFormFieldsProps) => {
	const { collectionName } = usePostContext();

	const isMarket = collectionName === 'Boards';
	const isCommunity = collectionName === 'Communities';

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
				<View style={{ width: '32%', flexDirection: 'row', marginBottom: 16 }}>
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
				containerStyle={styles.inputContainer}
				labelStyle={styles.label}
				inputStyle={styles.input}
				isSubmitted={isSubmitted}
			/>

			<BodyInput
				body={body}
				setBody={setBody}
				containerStyle={styles.inputContainer}
				labelStyle={styles.label}
				inputStyle={styles.input}
				isSubmitted={isSubmitted}
			/>

			{isCommunity && (
				<ImageInput
					images={images}
					setImages={setImages}
					containerStyle={styles.inputContainer}
					labelStyle={styles.label}
				/>
			)}

			{isMarket && (
				<ItemList
					cart={cart}
					setCart={setCart}
					containerStyle={styles.inputContainer}
					labelStyle={styles.label}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 16,
	},
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		marginBottom: 12,
		color: Colors.font_black,
	},
	input: {
		fontSize: FontSizes.md,
		borderWidth: 1,
		padding: 12,
		borderRadius: 8,
		borderColor: Colors.base,
		backgroundColor: Colors.base,
	},
});

export default PostFormFields;
