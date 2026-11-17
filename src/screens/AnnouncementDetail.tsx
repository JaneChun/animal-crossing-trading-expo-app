import { useRoute } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import LinkifiedText from '@/components/Announcement/LinkifiedText';
import Divider from '@/components/ui/Divider';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useAnnouncement } from '@/hooks/announcement/query/useAnnouncement';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { AnnouncementDetailRouteProp } from '@/types/navigation';
import { formatKstLongDate } from '@/utilities/kstDate';
import splashIcon from '@assets/images/splash_icon.png';

/** splash_icon.png 원본 크기(797x632)의 가로세로 비율 */
const LEAF_ASPECT_RATIO = 797 / 632;
const LEAF_WIDTH = 500;

const AnnouncementDetail = () => {
	const styles = useThemedStyles(makeStyles);
	const { params } = useRoute<AnnouncementDetailRouteProp>();
	const { data: announcement, isLoading } = useAnnouncement(params.id);

	if (isLoading) return <LoadingIndicator />;
	// 숨긴 공지는 유저에게 읽기 규칙으로 막혀 조회 오류가 나므로, 없는 공지와 같이 안내한다
	if (!announcement) return <EmptyIndicator message="공지를 찾을 수 없습니다." />;

	return (
		<View style={styles.screen}>
			{/* 잎 배경: 스크롤 영역 밖에 두어 본문을 스크롤해도 화면에 고정된다 */}
			<Image
				source={splashIcon}
				style={styles.leaf}
				resizeMode="contain"
				accessible={false}
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
			/>
			<ScrollView contentContainerStyle={styles.content}>
				<Text variant="title" weight="bold">
					{announcement.title}
				</Text>
				<Text variant="caption" color="tertiary" style={styles.date}>
					{formatKstLongDate(announcement.createdAt.toDate())}
				</Text>
				<Divider style={styles.divider} />
				<LinkifiedText variant="body1">{announcement.body}</LinkifiedText>
			</ScrollView>
		</View>
	);
};

const makeStyles = ({ colors, scheme }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
			overflow: 'hidden',
		},
		content: {
			padding: Spacing.xxl,
		},
		date: {
			marginTop: Spacing.s,
		},
		divider: {
			marginVertical: Spacing.l,
		},
		leaf: {
			position: 'absolute',
			right: -LEAF_WIDTH * 0.3,
			bottom: -Spacing.xxxl,
			width: LEAF_WIDTH,
			height: LEAF_WIDTH / LEAF_ASPECT_RATIO,
			transform: [{ rotate: '-12deg' }],
			// 다크 모드는 라이트보다 낮게. 기기에서 확인 후 조정한다
			opacity: scheme === 'dark' ? 0.12 : 0.26,
			pointerEvents: 'none',
		},
	});

export default AnnouncementDetail;
