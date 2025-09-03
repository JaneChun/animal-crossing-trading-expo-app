import PageIndicator from '@/components/PageIndicator';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Color';
import { ONBOARDING_DATA, OnboardingStep } from '@/constants/onboardingData';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useOnboardingStore } from '@/stores/onboarding/store';
import { saveOnboardingStatus } from '@/stores/onboarding/utils/storage';
import { replaceToHome } from '@/utilities/navigationHelpers';
import React, { useRef } from 'react';
import {
	Dimensions,
	FlatList,
	Image,
	NativeScrollEvent,
	NativeSyntheticEvent,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 24;
const SLIDE_WIDTH = SCREEN_WIDTH - PADDING * 2;

const Onboarding = () => {
	const currentStep = useOnboardingStore((state) => state.currentStep);
	const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
	const setHasCompletedOnboarding = useOnboardingStore((state) => state.setHasCompletedOnboarding);

	const flatListRef = useRef<FlatList>(null);
	const currentData = ONBOARDING_DATA[currentStep] || ONBOARDING_DATA[0];

	const handleNext = async () => {
		const lastStep = ONBOARDING_DATA.length - 1;

		if (currentStep < lastStep) {
			const nextStep = currentStep + 1;

			setCurrentStep(nextStep);
			flatListRef.current?.scrollToIndex({ index: nextStep, animated: true });
		} else {
			await handleCompleteOnboarding();
		}
	};

	const handleCompleteOnboarding = async () => {
		await saveOnboardingStatus();
		setHasCompletedOnboarding(true);

		replaceToHome();
	};

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(offsetX / SLIDE_WIDTH);

		setCurrentStep(index);
	};

	const renderSlide = ({ item }: { item: OnboardingStep }) => {
		return (
			<View style={[styles.slide, { width: SLIDE_WIDTH }]}>
				{/* 이미지 */}
				<View style={styles.imageContainer}>
					<Image source={item.image} style={styles.image} resizeMode='contain' />
				</View>

				{/* 뱃지 */}
				<View style={styles.content}>
					<View style={styles.badgeContainer}>
						<Text style={styles.badgeText}>모동숲 마켓 사용법</Text>
					</View>

					{/* 제목 및 설명 */}
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.description}>{item.description}</Text>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<View style={[styles.container, { padding: PADDING }]}>
				{/* 슬라이드 가능한 콘텐츠 영역 */}
				<FlatList
					ref={flatListRef}
					data={ONBOARDING_DATA}
					keyExtractor={(item) => item.step.toString()}
					renderItem={renderSlide}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onScroll={handleScroll}
					style={styles.flatList}
				/>

				{/* 인디케이터 */}
				<PageIndicator totalPages={ONBOARDING_DATA.length} currentIndex={currentStep} />

				{/* 버튼  */}
				<Button onPress={handleNext} color='mint' size='lg2'>
					{currentData.buttonText}
				</Button>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
	},
	flatList: {
		flex: 1,
	},
	slide: {
		flex: 1,
	},
	imageContainer: {
		flex: 1,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	content: {
		paddingHorizontal: 18,
		paddingVertical: 18,
	},
	badgeContainer: {
		backgroundColor: Colors.primary_background,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 50,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	badgeText: {
		color: Colors.primary_text,
		fontWeight: FontWeights.semibold,
	},
	title: {
		fontSize: FontSizes.xxl,
		fontWeight: FontWeights.bold,
		marginBottom: 16,
		color: Colors.font_black,
	},
	description: {
		fontSize: FontSizes.md,
		lineHeight: 24,
		color: Colors.font_dark_gray,
	},
});

export default Onboarding;
