import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	Easing,
	LayoutAnimationConfig,
	SlideInLeft,
	SlideInRight,
	SlideOutLeft,
	SlideOutRight,
} from 'react-native-reanimated';

import Divider from '@/components/ui/Divider';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useAnnouncements } from '@/hooks/announcement/query/useAnnouncements';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { Announcement } from '@/types/announcement';
import { navigateToAnnouncementDetail } from '@/utilities/navigationHelpers';

const ROTATE_INTERVAL_MS = 5000;
const SLIDE_DURATION_MS = 500;
// 가로로 이만큼 움직여야 스와이프로 인식하고, 세로로 먼저 이만큼 움직이면 목록 스크롤에 양보한다
const SWIPE_ACTIVE_OFFSET = 15;
const slideEasing = Easing.inOut(Easing.ease);

type SlideDirection = 'next' | 'prev';

// next: 오른쪽에서 들어와 왼쪽으로 나간다. prev: 그 반대
const slideAnimations = {
	next: {
		entering: SlideInRight.duration(SLIDE_DURATION_MS).easing(slideEasing),
		exiting: SlideOutLeft.duration(SLIDE_DURATION_MS).easing(slideEasing),
	},
	prev: {
		entering: SlideInLeft.duration(SLIDE_DURATION_MS).easing(slideEasing),
		exiting: SlideOutRight.duration(SLIDE_DURATION_MS).easing(slideEasing),
	},
};

// 마켓·커뮤니티 목록 머리에 붙는 한 줄 공지. 게시 중 공지가 없거나 조회 중·실패면 그리지 않는다
const AnnouncementTicker = () => {
	const { data: announcements = [], refetch } = useAnnouncements();

	// 탭 화면은 언마운트되지 않으므로, 탭에 다시 들어올 때 공지를 다시 조회한다.
	// 이미 조회 중이면 새 요청을 만들지 않는다
	useFocusEffect(
		useCallback(() => {
			refetch({ cancelRefetch: false });
		}, [refetch]),
	);

	if (announcements.length === 0) return null;

	// 공지 개수가 바뀌면 key가 바뀌어 첫 공지부터 다시 보여 준다
	return <TickerContent key={announcements.length} announcements={announcements} />;
};

const TickerContent = ({ announcements }: { announcements: Announcement[] }) => {
	const styles = useThemedStyles(makeStyles);
	const [index, setIndex] = useState(0);
	const [direction, setDirection] = useState<SlideDirection>('next');
	const current = announcements[index];
	const canRotate = announcements.length > 1;

	const goTo = useCallback(
		(nextDirection: SlideDirection) => {
			const step = nextDirection === 'next' ? 1 : -1;
			const nextIndex = (index + step + announcements.length) % announcements.length;
			const moveIndex = () => setIndex(nextIndex);

			if (nextDirection === direction) {
				moveIndex();
				return;
			}
			// 나가는 공지는 마지막으로 렌더링된 exiting 애니메이션을 쓴다.
			// 방향을 먼저 반영해 나가는 방향까지 바꾼 뒤, 다음 프레임에 공지를 넘긴다
			setDirection(nextDirection);
			requestAnimationFrame(moveIndex);
		},
		[announcements.length, direction, index],
	);

	// 화면이 포커스를 잃으면 전환을 멈추고, 돌아오면 이어서 전환한다.
	// goTo는 index가 바뀔 때마다 새로 만들어져 타이머도 새로 시작하므로, 스와이프로 넘긴 직후에는 자동 전환이 바로 일어나지 않는다
	useFocusEffect(
		useCallback(() => {
			if (!canRotate) return;

			const timer = setTimeout(() => goTo('next'), ROTATE_INTERVAL_MS);

			return () => clearTimeout(timer);
		}, [canRotate, goTo]),
	);

	// 왼쪽으로 밀면 다음 공지, 오른쪽으로 밀면 이전 공지.
	// 스와이프가 인식되면 gesture-handler가 Pressable의 터치를 취소하므로 상세 화면으로 이동하지 않는다
	const swipe = Gesture.Pan()
		.runOnJS(true)
		.enabled(canRotate)
		.activeOffsetX([-SWIPE_ACTIVE_OFFSET, SWIPE_ACTIVE_OFFSET])
		.failOffsetY([-SWIPE_ACTIVE_OFFSET, SWIPE_ACTIVE_OFFSET])
		.onEnd((event, success) => {
			if (!success) return;
			goTo(event.translationX < 0 ? 'next' : 'prev');
		});

	return (
		<View style={styles.container}>
			<GestureDetector gesture={swipe}>
				<Pressable
					style={styles.row}
					onPress={() => navigateToAnnouncementDetail(current.id)}
					accessibilityRole="button"
				>
					<View style={styles.badge}>
						<Feather name="volume-2" size={12} color={styles.badgeIcon.color} />
						<Text variant="caption" weight="semibold" color="primaryBrand">
							공지
						</Text>
					</View>
					<View style={styles.titleViewport}>
						{/* 첫 렌더링에서는 들어오는 애니메이션 없이 바로 보여 준다 */}
						<LayoutAnimationConfig skipEntering>
							<Animated.View
								key={current.id}
								entering={slideAnimations[direction].entering}
								exiting={slideAnimations[direction].exiting}
								style={styles.titleSlot}
							>
								<Text variant="body2" numberOfLines={1}>
									{current.title}
								</Text>
							</Animated.View>
						</LayoutAnimationConfig>
					</View>
				</Pressable>
			</GestureDetector>
			<Divider variant="section" />
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		// 목록(PostList)의 좌우 PADDING을 상쇄해 아래 띠가 화면 양끝까지 닿게 한다
		container: {
			marginHorizontal: -PADDING,
		},
		row: {
			height: 44,
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
			paddingHorizontal: PADDING,
		},
		badge: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xxs,
			paddingVertical: Spacing.xs,
			paddingHorizontal: 6,
			borderRadius: BorderRadius.xs,
			backgroundColor: colors.bg.primaryBrand,
		},
		badgeIcon: {
			color: colors.text.primaryBrand,
		},
		titleViewport: {
			flex: 1,
			alignSelf: 'stretch',
			overflow: 'hidden',
		},
		titleSlot: {
			...StyleSheet.absoluteFillObject,
			justifyContent: 'center',
		},
	});

export default AnnouncementTicker;
