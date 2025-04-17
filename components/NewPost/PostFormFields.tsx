import BodyInput from '@/components/NewPost/BodyInput';
import ImageInput from '@/components/NewPost/ImageInput';
import ItemList from '@/components/NewPost/ItemList';
import TitleInput from '@/components/NewPost/TitleInput';
import TypeSelect from '@/components/NewPost/TypeSelect';
import DropdownInput from '@/components/ui/DropdownInput';
import { Colors } from '@/constants/Color';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { PostFormFieldsProps } from '@/types/components';
import { CommunityType, MarketType } from '@/types/post';
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
				/>
			)}
			{isCommunity && (
				<View style={{ width: '30%', flexDirection: 'row', marginBottom: 16 }}>
					<DropdownInput
						options={dropdownOptions}
						value={type as CommunityType}
						setValue={setType as Dispatch<SetStateAction<CommunityType>>}
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
		fontSize: 16,
		fontWeight: 600,
		marginBottom: 12,
		color: Colors.font_black,
	},
	input: {
		fontSize: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: Colors.base,
	},
});

export default PostFormFields;
