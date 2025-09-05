import Slide from '@/components/Onboarding/Slide';
import PageIndicator from '@/components/PageIndicator';
import Button from '@/components/ui/Button';
import { ONBOARDING_DATA, OnboardingStep } from '@/constants/onboardingData';
import { useOnboardingStore } from '@/stores/onboarding/store';
import { saveOnboardingAsCompleted } from '@/stores/onboarding/utils/storage';
import { replaceToHome } from '@/utilities/navigationHelpers';
import React, { useRef } from 'react';
import {
	Dimensions,
	FlatList,
	NativeScrollEvent,
	NativeSyntheticEvent,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
		await saveOnboardingAsCompleted();
		setHasCompletedOnboarding(true);

		replaceToHome();
	};

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(offsetX / SCREEN_WIDTH);

		setCurrentStep(index);
	};

	const renderSlide = ({ item, index }: { item: OnboardingStep; index: number }) => {
		const isLast = index === ONBOARDING_DATA.length - 1;

		return <Slide item={item} width={SCREEN_WIDTH} showBadge={isLast ? false : true} />;
	};

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<View style={styles.container}>
				{/* 슬라이드 가능한 콘텐츠 영역 */}
				<FlatList
					ref={flatListRef}
					data={ONBOARDING_DATA}
					keyExtractor={(item) => item.step.toString()}
					renderItem={renderSlide}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={handleScroll}
					style={styles.flatList}
				/>

				{/* 인디케이터 */}
				<PageIndicator totalPages={ONBOARDING_DATA.length} currentIndex={currentStep} />

				{/* 버튼  */}
				<Button onPress={handleNext} color='mint' size='lg2' style={styles.button}>
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
	button: {
		marginHorizontal: 24,
	},
});

export default Onboarding;
