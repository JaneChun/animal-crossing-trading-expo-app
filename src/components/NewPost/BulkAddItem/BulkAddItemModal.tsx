import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { showToast } from '@/components/ui/Toast';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import { useBulkAddSelection } from '@/hooks/item/useBulkAddSelection';
import { Colors } from '@/theme/Color';
import { type BulkAddItemModalProps } from '@/types/components';
import { logBulkAddConfirm } from '@/utilities/analytics';

import Review from './Review';
import ThreeDotsLoadingIndicator from '../../ui/loading/ThreeDotsLoadingIndicator';

const BulkAddItemModal = ({
	cart,
	isVisible,
	initialText,
	onClose,
	addItemsToCart,
}: BulkAddItemModalProps) => {
	const {
		isPending,
		foundItems,
		reviewItems,
		failedResults,
		selectedReviewItems,
		selectedCount,
		isOverCapacity,
		addableItems,
		selectReviewCandidate,
		getConfirmStats,
		reset,
	} = useBulkAddSelection({
		cart,
		isVisible,
		initialText,
		onSearchError: () => {
			showToast('error', '아이템 검색에 실패했어요. 다시 시도해주세요.');
			onClose();
		},
	});

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [reset, onClose]);

	const handleConfirm = () => {
		addItemsToCart(addableItems);
		logBulkAddConfirm(getConfirmStats());
		handleClose();
	};

	return (
		<CustomBottomSheet
			bodyStyle={styles.container}
			isVisible={isVisible}
			onClose={handleClose}
			snapPoints={['95%']}
		>
			{isPending ? (
				<View style={styles.loadingContainer}>
					<ThreeDotsLoadingIndicator style={styles.loadingIndicator} />
					<Text style={styles.loadingText}>
						{'붙여넣은 텍스트에서\n아이템을 찾고 있어요…'}
					</Text>
				</View>
			) : (
				<Review
					cart={cart}
					foundItems={foundItems}
					reviewItems={reviewItems}
					failedResults={failedResults}
					selectedCount={selectedCount}
					isOverCapacity={isOverCapacity}
					selectedReviewItems={selectedReviewItems}
					onSelectReviewCandidate={selectReviewCandidate}
					onConfirm={handleConfirm}
				/>
			)}
		</CustomBottomSheet>
	);
};

export default BulkAddItemModal;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 0,
		paddingBottom: 30,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 24,
		paddingBottom: 72,
	},
	loadingIndicator: {
		width: 132,
	},
	loadingText: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.bold,
		lineHeight: LineHeights.xl,
		textAlign: 'center',
		color: Colors.text.primary,
	},
});
