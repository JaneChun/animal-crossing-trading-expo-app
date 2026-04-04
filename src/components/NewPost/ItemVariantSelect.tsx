import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { useItemVariants } from '@/hooks/item/query/useItemVariants';
import { Colors } from '@/theme/Color';
import { CatalogItem, CatalogVariant } from '@/types/catalog';

import VariantOptionList from './VariantOptionList';
import InlineLoadingIndicator from '../ui/loading/InlineLoadingIndicator';

interface ItemVariantSelectProps {
	item: CatalogItem;
	onBack: () => void;
	onSelect: (variant: CatalogVariant) => void;
}

const ItemVariantSelect = ({ item, onBack, onSelect }: ItemVariantSelectProps) => {
	const { data: variants, isLoading } = useItemVariants(item.id);

	const [selectedBody, setSelectedBody] = useState<string | null>(null);
	const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'body' | 'pattern'>(
		item.bodyTitle ? 'body' : 'pattern',
	);

	const bodyOptions = useMemo(() => {
		if (!variants || !item.bodyTitle) return [];
		// 중복 body 제거
		const uniqueMap = new Map<string, string>();
		variants.forEach((v) => {
			if (v.body && !uniqueMap.has(v.body)) {
				// X_0 패턴(가장 첫번째)를 썸네일로 사용
				uniqueMap.set(v.body, v.imageUrl);
			}
		});
		return Array.from(uniqueMap.entries()).map(([body, imageUrl]) => ({
			label: body,
			imageUrl,
		}));
	}, [variants, item.bodyTitle]);

	const patternOptions = useMemo(() => {
		if (!variants || !item.patternTitle) return [];

		// 바디가 있다면 선택된 바디에 해당하는 패턴만
		const filtered = item.bodyTitle
			? variants.filter((v) => v.body === selectedBody)
			: variants;

		return filtered.map(({ pattern, imageUrl }) => ({ label: pattern ?? '', imageUrl }));
	}, [variants, item.patternTitle, selectedBody, item.bodyTitle]);

	const handleSelectBody = (option: string) => {
		setSelectedBody(option);
		if (item.patternTitle) {
			setSelectedPattern(null);
			setActiveTab('pattern');
		} else {
			// 바디만 있으면 바로 확정
			handleFinalSelect(option, null);
		}
	};

	const handleSelectPattern = (option: string) => {
		setSelectedPattern(option);
		handleFinalSelect(selectedBody, option);
	};

	const handleFinalSelect = (body: string | null, pattern: string | null) => {
		if (!variants) return;
		const finalVariant = variants.find(
			(v) =>
				(item.bodyTitle ? v.body === body : true) &&
				(item.patternTitle ? v.pattern === pattern : true),
		);
		if (finalVariant) {
			onSelect(finalVariant);
		}
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
					{item[`${activeTab}Title`]}
				</Text>
			</View>

			{/* Body */}
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<InlineLoadingIndicator />
				</View>
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		paddingHorizontal: 24,
	},
});
