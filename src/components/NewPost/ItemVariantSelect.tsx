import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { useItemVariants } from '@/hooks/item/query/useItemVariants';
import { Colors } from '@/theme/Color';
import { CatalogItem, CatalogVariant } from '@/types/catalog';

import VariantOptionList from './VariantOptionList';
import VariantOptionListSkeleton from './VariantOptionListSkeleton';

interface ItemVariantSelectProps {
	item: CatalogItem;
	onBack: () => void;
	onSelect: (variant: CatalogVariant) => void;
}

const ItemVariantSelect = ({ item, onBack, onSelect }: ItemVariantSelectProps) => {
	const { data: variants, isLoading } = useItemVariants(item.id);

	const localVariants = useMemo(() => {
		if (!variants || !item.bodyTitle) return variants ?? [];

		const firstVariant = variants.find((v) => v.variantId === '0_0');
		if (!firstVariant) return variants;

		return [
			{
				id: `${item.id}_any`,
				variantId: '0_0',
				body: '색상 무관',
				pattern: null,
				imageUrl: firstVariant.imageUrl,
			},
			...variants,
		];
	}, [variants, item.id, item.bodyTitle]);

	const [selectedBody, setSelectedBody] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'body' | 'pattern'>(
		item.bodyTitle ? 'body' : 'pattern',
	);

	const bodyOptions = useMemo(() => {
		if (!item.bodyTitle) return [];

		// variantId가 x_0인 것만 사용 (각 body의 첫 번째 패턴을 썸네일로)
		// variantId: '0_0'인 색상 무관이 정렬 시 자연스럽게 맨 앞에 위치
		return localVariants
			.filter((v) => v.variantId.endsWith('_0'))
			.sort((a, b) => a.variantId.localeCompare(b.variantId))
			.map(({ body, imageUrl }) => ({ label: body ?? '', imageUrl }));
	}, [localVariants, item.bodyTitle]);

	const patternOptions = useMemo(() => {
		if (!item.patternTitle) return [];

		const filtered = localVariants
			.filter((v) => v.body === selectedBody)
			.sort((a, b) => a.variantId.localeCompare(b.variantId))
			.map(({ pattern, imageUrl }) => ({
				label: pattern ?? '',
				imageUrl,
			}));

		return filtered;
	}, [localVariants, item.patternTitle, selectedBody]);

	const handleSelectBody = (option: string) => {
		setSelectedBody(option);
		if (item.patternTitle && option !== '색상 무관') {
			setActiveTab('pattern');
		} else {
			handleFinalSelect(option, null);
		}
	};

	const handleSelectPattern = (option: string) => {
		handleFinalSelect(selectedBody, option);
	};

	const handleFinalSelect = (body: string | null, pattern: string | null) => {
		if (!localVariants.length) return;

		const finalVariant = localVariants.find((v) => v.body === body && v.pattern === pattern);

		if (finalVariant) onSelect(finalVariant);
	};

	const handleBack = useCallback(() => {
		// pattern 탭에서 뒤로가기면 바디 탭으로
		if (activeTab === 'pattern' && item.bodyTitle) {
			setActiveTab('body');
		} else {
			// body 탭에서 뒤로가기면 목록으로
			onBack();
		}
	}, [activeTab, item.bodyTitle, onBack]);

	const backLabel = activeTab === 'pattern' && item.bodyTitle ? item.bodyTitle : '목록';

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleBack} style={styles.backButtonContainer}>
					<Feather name="chevron-left" size={24} color={Colors.text.tertiary} />
					<Text style={styles.backButtonText} numberOfLines={1}>
						{backLabel}
					</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{activeTab === 'body' ? item.bodyTitle : item.patternTitle}
				</Text>
			</View>

			{/* Body */}
			{isLoading ? (
				<VariantOptionListSkeleton />
			) : (
				<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
					{activeTab === 'body' && item.bodyTitle && (
						<VariantOptionList options={bodyOptions} onSelect={handleSelectBody} />
					)}

					{activeTab === 'pattern' && item.patternTitle && (
						<VariantOptionList
							options={patternOptions}
							onSelect={handleSelectPattern}
						/>
					)}
				</ScrollView>
			)}
		</View>
	);
};

export default ItemVariantSelect;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
	},
	header: {
		paddingVertical: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	backButtonContainer: {
		padding: 4,
		position: 'absolute',
		left: 8,
		flexDirection: 'row',
		alignItems: 'center',
		zIndex: 1,
		maxWidth: 120, // 방어 코드: 너무 길어지면 ... 처리
	},
	backButtonText: {
		fontSize: FontSizes.md,
		color: Colors.text.tertiary,
	},
	headerTitle: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		color: Colors.text.primary,
		textAlign: 'center',
		paddingHorizontal: 120, // 좌우 텍스트 겹침 방지
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		paddingHorizontal: 24,
	},
});
