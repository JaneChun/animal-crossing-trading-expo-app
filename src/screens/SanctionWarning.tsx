import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PolicyCard from '@/components/Sanction/PolicyCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useAcknowledgeSanction } from '@/hooks/sanction/mutation/useAcknowledgeSanction';
import { useMySanctions } from '@/hooks/sanction/query/useMySanctions';
import { goBack, navigationRef, resetTo } from '@/navigation/RootNavigation';
import { useUserInfo } from '@/stores/auth';
import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { SanctionWarningRouteProp } from '@/types/navigation';
import { Sanction } from '@/types/sanction';
import { formatKstDateTime } from '@/utilities/kstDate';
import { navigateToOperationPolicy } from '@/utilities/navigationHelpers';
import { getSanctionTargetKind, getSanctionTargetText } from '@/utilities/sanction';

const TITLES = {
	post: '이 글은 비공개 처리되었습니다',
	comment: '이 댓글은 비공개 처리되었습니다',
	chat: '운영 정책 위반으로 경고를 받았습니다',
} as const;

const close = () => {
	if (navigationRef.isReady() && navigationRef.canGoBack()) goBack();
	else resetTo('MainTab');
};

// 경고 조치 후 앱을 열면 한 번 보여 주는 화면. [정책을 확인했습니다]를 누르면 다시 띄우지 않는다
const SanctionWarning = () => {
	const styles = useThemedStyles(makeStyles);
	const { params } = useRoute<SanctionWarningRouteProp>();
	const userInfo = useUserInfo();
	const uid = userInfo?.uid ?? '';
	const { data: sanctions, isLoading } = useMySanctions(uid);
	const { mutate: acknowledge, isPending } = useAcknowledgeSanction(uid);
	const sanction = sanctions?.find(({ id }) => id === params.sanctionId);

	// 조치를 읽지 못했거나(로그아웃, 조회 실패) 이미 없는 조치면 빈 화면에 갇히지 않도록 닫는다
	useEffect(() => {
		if (!isLoading && !sanction) close();
	}, [isLoading, sanction]);

	if (isLoading || !sanction) return <LoadingIndicator />;

	const targetKind = getSanctionTargetKind(sanction);
	const isContentTarget = targetKind === 'post' || targetKind === 'comment';
	const title = isContentTarget ? TITLES[targetKind] : TITLES.chat;

	// 확인 기록이 실패해도 화면은 닫는다(다음 실행 때 다시 보여 준다)
	const onPressAcknowledge = () => acknowledge(sanction.id, { onSettled: close });

	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.heading}>
					<Badge text="운영 정책 위반 안내" tone="orange" containerStyle={styles.chip} />
					<Text variant="title" weight="bold">
						{title}
					</Text>
				</View>

				{isContentTarget && <TargetCard sanction={sanction} />}

				<PolicyCard violationType={sanction.violationType} />

				<View style={styles.notice}>
					<Text variant="caption" color="tertiary" style={styles.centerText}>
						정책 위반이 반복되면 계정 이용이 제한될 수 있습니다.
					</Text>
					<Pressable onPress={navigateToOperationPolicy}>
						<Text variant="caption" color="primaryBrand">
							운영 정책 보기
						</Text>
					</Pressable>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Button size="lg" isLoading={isPending} onPress={onPressAcknowledge}>
					정책을 확인했습니다
				</Button>
			</View>
		</SafeAreaView>
	);
};

// 비공개 처리된 글·댓글: 조치 시점 스냅샷의 제목(본문)과 작성 시각
const TargetCard = ({ sanction }: { sanction: Sanction }) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const targetText = getSanctionTargetText(sanction);
	const createdAt = sanction.target?.snapshot?.createdAt;

	return (
		<View style={styles.targetCard}>
			<View style={styles.targetIcon}>
				<MaterialIcons
					name={
						getSanctionTargetKind(sanction) === 'comment' ? 'mode-comment' : 'article'
					}
					size={24}
					color={colors.text.tertiary}
				/>
			</View>
			<View style={styles.targetTexts}>
				{!!targetText && (
					<Text variant="body1" weight="semibold" numberOfLines={1}>
						{targetText}
					</Text>
				)}
				{!!createdAt && (
					<Text variant="caption" color="tertiary">
						{formatKstDateTime(createdAt.toDate())}
					</Text>
				)}
			</View>
		</View>
	);
};

export default SanctionWarning;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			flexGrow: 1,
			paddingHorizontal: PADDING,
			paddingTop: Spacing.xxxl,
			paddingBottom: Spacing.l,
			gap: Spacing.xxl,
		},
		heading: {
			gap: Spacing.s,
		},
		chip: {
			alignSelf: 'flex-start',
		},
		targetCard: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			padding: Spacing.m,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		targetIcon: {
			width: 56,
			height: 56,
			borderRadius: BorderRadius.s,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.bg.fill,
		},
		targetTexts: {
			flex: 1,
			minWidth: 0,
			gap: Spacing.xxs,
		},
		notice: {
			marginTop: 'auto',
			alignItems: 'center',
			gap: Spacing.xxs,
		},
		centerText: {
			textAlign: 'center',
		},
		footer: {
			paddingHorizontal: PADDING,
			paddingTop: Spacing.m,
			paddingBottom: Spacing.s,
			gap: Spacing.s,
		},
	});
