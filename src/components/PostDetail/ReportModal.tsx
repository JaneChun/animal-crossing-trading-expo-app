import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { REPORT_CATEGORIES } from '@/constants/post';
import { ReportUserParams } from '@/types/components';
import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';

type ReportModalProps = {
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (data: ReportUserParams) => void;
};

const ReportModal = ({ isVisible, onClose, onSubmit }: ReportModalProps) => {
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [detail, setDetail] = useState<string>('');

	const handleNext = () => {
		if (!selectedCategory) return;
		setStep(2);
	};

	const handleBack = () => {
		console.log('back');
		setStep(1);
	};

	const handleSubmit = () => {
		if (!selectedCategory) return;
		onSubmit({ category: selectedCategory, detail });
		onClose();
	};

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={onClose}
			title='신고하기'
			heightRatio={0.6}
			rightButton={
				step === 1 ? (
					<Button
						disabled={!selectedCategory}
						color='white'
						size='md2'
						onPress={handleNext}
					>
						다음
					</Button>
				) : (
					<Button color='white' size='md2' onPress={handleSubmit}>
						제출
					</Button>
				)
			}
			leftButton={
				step === 1 ? null : (
					<Button color='gray' size='md2' onPress={handleBack}>
						이전
					</Button>
				)
			}
		>
			<View style={styles.screen}>
				{step === 1 && (
					<>
						<Text style={styles.label}>신고 사유</Text>
						{REPORT_CATEGORIES?.map((category) => (
							<Pressable
								key={category.EN}
								style={[
									styles.categoryButton,
									selectedCategory === category.EN && styles.selectedCategory,
								]}
								onPress={() => setSelectedCategory(category.EN)}
							>
								<Text
									style={[
										styles.categoryText,
										selectedCategory === category.EN &&
											styles.selectedCategoryText,
									]}
								>
									{category.KR}
								</Text>
							</Pressable>
						))}
					</>
				)}

				{step === 2 && (
					<>
						<Text style={styles.label}>상세 내용 (선택)</Text>
						<BottomSheetTextInput
							style={styles.textInput}
							placeholder='자세한 내용을 입력해주세요'
							value={detail}
							onChangeText={setDetail}
							multiline
						/>
					</>
				)}
			</View>
		</CustomBottomSheet>
	);
};

export default ReportModal;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
		marginBottom: 16,
	},
	categoryButton: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		marginBottom: 10,
	},
	selectedCategory: {
		borderColor: Colors.primary,
		backgroundColor: '#e6f8f5',
	},
	categoryText: {
		color: Colors.font_black,
		fontSize: FontSizes.md,
	},
	selectedCategoryText: {
		color: Colors.primary,
		fontWeight: 'bold',
	},
	textInput: {
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		padding: 12,
		height: 100,
		textAlignVertical: 'top',
		lineHeight: 26,
		fontSize: FontSizes.md,
	},
});
