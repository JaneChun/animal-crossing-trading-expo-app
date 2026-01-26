import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import DropdownInput from '@/components/ui/inputs/DropdownInput';
import { PADDING } from '@/components/ui/layout/Layout';
import { Colors } from '@/constants/Color';
import { COMMUNITY_TYPES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { PostFormProps } from '@/types/components';
import { MarketType } from '@/types/post';

import BodyInput from './BodyInput';
import ImageInput from './ImageInput';
import ItemList from './ItemList';
import TitleInput from './TitleInput';
import TypeSelect from './TypeSelect';
import VillagerList from './VillagerList';

const PostForm = ({
	collectionName,
	scrollViewRef,
	handleEditItemPress,
	deleteItemFromCart,
	deleteVillager,
	openAddVillagerModal,
	selectedVillagers,
}: PostFormProps) => {
	const { control, watch, setValue } = useFormContext();
	const currentType = watch('type');

	const isMarket = collectionName === 'Boards';
	const isCommunity = collectionName === 'Communities';

	// 분양/입양 타입이 아닐 때 villagers 초기화
	useEffect(() => {
		if (currentType !== 'giveaway' && currentType !== 'adopt') {
			setValue('villagers', []);
		}
	}, [currentType, setValue]);

	const dropdownOptions = COMMUNITY_TYPES.map(({ KR, EN }) => ({
		text: KR,
		value: EN,
	}));

	return (
		<ScrollView ref={scrollViewRef} style={{ padding: PADDING }}>
			{isMarket && (
				<Controller
					control={control}
					name="type"
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
					name="type"
					render={({ field: { value, onChange } }) => (
						<DropdownInput
							options={dropdownOptions}
							value={value}
							setValue={onChange}
							// topOffset={100}
							style={{ width: '40%', marginBottom: 16 }}
						/>
					)}
				/>
			)}

			{/* 제목 입력 */}
			<Controller
				control={control}
				name="title"
				render={({ field: { value, onChange, onBlur } }) => (
					<TitleInput
						title={value}
						setTitle={onChange}
						onBlur={onBlur}
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
				name="body"
				render={({ field: { value, onChange, onBlur } }) => (
					<BodyInput
						body={value}
						setBody={onChange}
						onBlur={onBlur}
						containerStyle={styles.inputContainer}
						inputStyle={styles.input}
					/>
				)}
			/>

			{/* 커뮤니티용 이미지 업로드 */}
			{isCommunity && (
				<Controller
					control={control}
					name="images"
					render={({ field: { value, onChange } }) => (
						<ImageInput
							images={value}
							setImages={onChange}
							containerStyle={styles.inputContainer}
							labelStyle={styles.label}
						/>
					)}
				/>
			)}

			{/* 분양/입양용 주민 목록 */}
			{isCommunity && (currentType === 'giveaway' || currentType === 'adopt') && (
				<VillagerList
					villagers={selectedVillagers}
					deleteVillager={deleteVillager}
					openAddVillagerModal={openAddVillagerModal}
					containerStyle={{
						...styles.inputContainer,
						borderBottomWidth: 0,
					}}
					labelStyle={styles.label}
				/>
			)}

			{/* 마켓용 아이템 리스트 */}
			{isMarket && (
				<Controller
					control={control}
					name="cart"
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
		</ScrollView>
	);
};

export default PostForm;

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
