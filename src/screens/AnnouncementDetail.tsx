import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnnouncementFormSheet from '@/components/Announcement/AnnouncementFormSheet';
import LinkifiedText from '@/components/Announcement/LinkifiedText';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { showToast } from '@/components/ui/Toast';
import { auth } from '@/config/firebase';
import { useAnnouncement } from '@/hooks/announcement/query/useAnnouncement';
import { useUserInfo } from '@/stores/auth';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { AnnouncementForm } from '@/types/announcement';
import { AnnouncementDetailRouteProp } from '@/types/navigation';
import { formatKstLongDate } from '@/utilities/kstDate';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import splashIcon from '@assets/images/splash_icon.png';

/** splash_icon.png 원본 크기(797x632)의 가로세로 비율 */
const LEAF_ASPECT_RATIO = 797 / 632;
const LEAF_WIDTH = 500;

const FORM_BUTTON_LABELS: Record<AnnouncementForm, string> = {
	androidTester: '테스터 신청하기',
	feedback: '의견 보내기',
};

// form은 콘솔에서 직접 넣으므로, 정의되지 않은 값이면 버튼 없이 본문만 보여준다
const isAnnouncementForm = (form: unknown): form is AnnouncementForm =>
	typeof form === 'string' && form in FORM_BUTTON_LABELS;

const AnnouncementDetail = () => {
	const styles = useThemedStyles(makeStyles);
	const { params } = useRoute<AnnouncementDetailRouteProp>();
	const { data: announcement, isLoading } = useAnnouncement(params.id);
	const userInfo = useUserInfo();
	const insets = useSafeAreaInsets();
	const [isSheetVisible, setIsSheetVisible] = useState(false);
	// 기기에 저장하지 않으므로 상세를 나갔다 오면 다시 신청할 수 있다
	const [isTesterSubmitted, setIsTesterSubmitted] = useState(false);

	if (isLoading) return <LoadingIndicator />;
	// 숨긴 공지는 유저에게 읽기 규칙으로 막혀 조회 오류가 나므로, 없는 공지와 같이 안내한다
	if (!announcement) return <EmptyIndicator message="공지를 찾을 수 없습니다." />;

	const form = isAnnouncementForm(announcement.form) ? announcement.form : null;
	const isFormButtonDisabled = form === 'androidTester' && isTesterSubmitted;
	const buttonBottomPadding = Math.max(Spacing.s, insets.bottom);

	const onPressFormButton = () => {
		if (form === 'feedback' && (!userInfo || !auth.currentUser)) {
			showToast('warn', '의견 보내기는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		setIsSheetVisible(true);
	};

	const closeSheet = () => setIsSheetVisible(false);

	return (
		<View style={styles.screen}>
			{/* 잎 배경: 스크롤 영역 밖에 두어 본문을 스크롤해도 화면에 고정된다 */}
			{/* 스플래시 화면이 같은 이미지를 FastImage로 먼저 띄우므로, 메모리 캐시를 써서 본문과 함께 바로 표시된다 */}
			<FastImage
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
			{form && (
				<>
					<View style={[styles.buttonContainer, { paddingBottom: buttonBottomPadding }]}>
						<Button
							variant="primary"
							size="lg"
							flex
							disabled={isFormButtonDisabled}
							onPress={onPressFormButton}
						>
							{isFormButtonDisabled ? '신청 완료' : FORM_BUTTON_LABELS[form]}
						</Button>
					</View>
					<AnnouncementFormSheet
						isVisible={isSheetVisible}
						onClose={closeSheet}
						title={FORM_BUTTON_LABELS[form]}
						submitLabel="제출"
						submitDisabled
						isSubmitting={false}
						onSubmit={() => setIsTesterSubmitted(true)}
					>
						{null}
					</AnnouncementFormSheet>
				</>
			)}
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
		buttonContainer: {
			flexDirection: 'row',
			paddingHorizontal: PADDING,
			paddingTop: Spacing.s,
			// 잎 배경 위에 겹치므로 배경을 채운다
			backgroundColor: colors.bg.primary,
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
