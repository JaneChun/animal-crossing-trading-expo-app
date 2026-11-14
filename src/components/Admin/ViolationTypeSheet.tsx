import { useState } from 'react';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { ViolationType } from '@/types/sanction';

import ViolationTypeList from './ViolationTypeList';

type ViolationTypeSheetProps = {
	isVisible: boolean;
	onClose: () => void;
	onComplete: (type: ViolationType) => void;
};

// 신고 상세 [숨기기]에서 경고의 위반 유형을 고른다. 정지 바텀시트의 위반 유형 단계와 같은 모양
const ViolationTypeSheet = ({ isVisible, onClose, onComplete }: ViolationTypeSheetProps) => {
	const [selected, setSelected] = useState<ViolationType | null>(null);

	const handleComplete = () => {
		if (!selected) return;
		onComplete(selected);
		setSelected(null);
	};

	const handleClose = () => {
		setSelected(null);
		onClose();
	};

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={handleClose}
			title="위반 유형"
			snapPoints={['75%']}
			rightButton={
				<Button variant="outline" size="md" disabled={!selected} onPress={handleComplete}>
					완료
				</Button>
			}
		>
			<ViolationTypeList selected={selected} onSelect={setSelected} />
		</CustomBottomSheet>
	);
};

export default ViolationTypeSheet;
