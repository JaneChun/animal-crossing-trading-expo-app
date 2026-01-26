import React from 'react';
import Thumbnail from '@/components/ui/Thumbnail';
import { useVillagersByIds } from '@/hooks/villager/query/useVillagersByIds';

interface CommunityThumbnailProps {
	images: string[];
	villagers?: string[];
}

const CommunityThumbnail = ({ images, villagers = [] }: CommunityThumbnailProps) => {
	const hasImage = images.length > 0;
	const idsToFetch = !hasImage && villagers[0] ? [villagers[0]] : [];
	const [previewVillager] = useVillagersByIds(idsToFetch);

	if (hasImage) {
		return <Thumbnail previewImage={images[0]} />;
	}

	if (previewVillager) {
		return <Thumbnail previewImage={previewVillager.imageUrl} />;
	}

	return null;
};

export default React.memo(CommunityThumbnail);
