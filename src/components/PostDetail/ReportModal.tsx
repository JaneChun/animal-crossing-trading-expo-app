import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import Text from '@/components/ui/Text';
import { REPORT_CATEGORIES } from '@/constants/post';
import { FontSizes, Theme, useThemedStyles } from '@/theme';
import { ReportUserParams } from '@/types/components';

type ReportModalProps = {
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (data: ReportUserParams) => void;
};

const ReportModal = ({ isVisible, onClose, onSubmit }: ReportModalProps) => {
	const styles = useThemedStyles(makeStyles);
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [detail, setDetail] = useState<string>('');

	const handleNext = () => {
		if (!selectedCategory) return;
		setStep(2);
	};

	const handleBack = () => {
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
			title="신고하기"
			snapPoints={['60%']}
			rightButton={
				step === 1 ? (
					<Button
						disabled={!selectedCategory}
						variant="outline"
						size="md"
						onPress={handleNext}
					>
						다음
					</Button>
				) : (
					<Button variant="outline" size="md" onPress={handleSubmit}>
						제출
					</Button>
				)
			}
			leftButton={
				step === 1 ? null : (
					<Button variant="secondary" size="md" onPress={handleBack}>
						이전
					</Button>
				)
			}
		>
			<View style={styles.screen}>
				{step === 1 && (
					<>
						<Text variant="body1" weight="semibold" style={styles.label}>
							신고 사유
						</Text>
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
									variant="body1"
									weight={selectedCategory === category.EN ? 'bold' : 'regular'}
									style={
										selectedCategory === category.EN &&
										styles.selectedCategoryText
									}
								>
									{category.KR}
								</Text>
							</Pressable>
						))}
					</>
				)}

				{step === 2 && (
					<>
						<Text variant="body1" weight="semibold" style={styles.label}>
							상세 내용 (선택)
						</Text>
						<BottomSheetTextInput
							style={styles.textInput}
							placeholder="자세한 내용을 입력해주세요"
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

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
		},
		label: {
			marginBottom: 16,
		},
		categoryButton: {
			padding: 12,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border.default,
			marginBottom: 10,
		},
		selectedCategory: {
			borderColor: colors.brand.primary,
			backgroundColor: colors.brand.secondary,
		},
		selectedCategoryText: {
			color: colors.brand.primary,
		},
		textInput: {
			color: colors.text.primary,
			borderWidth: 1,
			borderColor: colors.border.default,
			borderRadius: 8,
			padding: 12,
			height: 100,
			textAlignVertical: 'top',
			lineHeight: 26,
			fontSize: FontSizes.md,
		},
	});
