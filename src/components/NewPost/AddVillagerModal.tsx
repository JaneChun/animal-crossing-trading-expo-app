import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { AddVillagerModalProps } from '@/types/components';

import VillagerSelect from './VillagerSelect';

const AddVillagerModal = ({ addVillager, isVisible, onClose }: AddVillagerModalProps) => {
	return (
		<CustomBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={['95%', '100%']}>
			<VillagerSelect addVillager={addVillager} />
		</CustomBottomSheet>
	);
};

export default AddVillagerModal;
