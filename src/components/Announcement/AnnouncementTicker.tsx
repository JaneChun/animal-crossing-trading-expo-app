import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	LayoutAnimationConfig,
	SlideInRight,
	SlideOutLeft,
} from 'react-native-reanimated';

import Divider from '@/components/ui/Divider';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useAnnouncements } from '@/hooks/announcement/query/useAnnouncements';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { Announcement } from '@/types/announcement';
import { navigateToAnnouncementDetail } from '@/utilities/navigationHelpers';

const ROTATE_INTERVAL_MS = 4000;
const SLIDE_DURATION_MS = 450;
const slideEasing = Easing.inOut(Easing.ease);
const slideIn = SlideInRight.duration(SLIDE_DURATION_MS).easing(slideEasing);
const slideOut = SlideOutLeft.duration(SLIDE_DURATION_MS).easing(slideEasing);

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
	const current = announcements[index];

	// 화면이 포커스를 잃으면 전환을 멈추고, 돌아오면 이어서 전환한다
	useFocusEffect(
		useCallback(() => {
			if (announcements.length < 2) return;

			const timer = setInterval(() => {
				setIndex((prev) => (prev + 1) % announcements.length);
			}, ROTATE_INTERVAL_MS);

			return () => clearInterval(timer);
		}, [announcements.length]),
	);

	return (
		<View style={styles.container}>
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
							entering={slideIn}
							exiting={slideOut}
							style={styles.titleSlot}
						>
							<Text variant="body2" numberOfLines={1}>
								{current.title}
							</Text>
						</Animated.View>
					</LayoutAnimationConfig>
				</View>
			</Pressable>
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
