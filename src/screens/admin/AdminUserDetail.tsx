import { FontAwesome6 } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import DangerActionPanel from '@/components/Admin/DangerActionPanel';
import InfoRow from '@/components/Admin/InfoRow';
import StatStrip from '@/components/Admin/StatStrip';
import { isSuspended } from '@/components/Admin/SuspensionBadge';
import ViewAllLink from '@/components/Admin/ViewAllLink';
import ProfileBox from '@/components/Profile/Profile';
import Badge from '@/components/ui/Badge';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import Apple from '@/components/ui/Icons/Apple';
import Google from '@/components/ui/Icons/Google';
import Kakao from '@/components/ui/Icons/Kakao';
import Naver from '@/components/ui/Icons/Naver';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useLiftSuspension } from '@/hooks/admin/mutation/useLiftSuspension';
import { useAdminUserInfo } from '@/hooks/admin/query/useAdminUserInfo';
import { useUserStats } from '@/hooks/admin/query/useUserStats';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { AdminUserDetailRouteProp } from '@/types/navigation';
import { OauthType } from '@/types/user';
import { elapsedTime } from '@/utilities/elapsedTime';
import { formatKstDate, formatKstMonthDay } from '@/utilities/kstDate';
import { navigateToUserProfile } from '@/utilities/navigationHelpers';

const OAUTH_LABELS: Record<OauthType, string> = {
	kakao: '카카오',
	naver: '네이버',
	apple: 'Apple',
	google: 'Google',
};

const noop = () => {};

const formatCount = (count: number | undefined) =>
	count !== undefined ? count.toLocaleString('ko-KR') : '-';

const AdminUserDetail = () => {
	const { params } = useRoute<AdminUserDetailRouteProp>();

	return (
		<AdminGuard>
			<UserDetailContent uid={params.uid} />
		</AdminGuard>
	);
};

const UserDetailContent = ({ uid }: { uid: string }) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const { data: user, isLoading } = useAdminUserInfo(uid);
	const { data: stats } = useUserStats(uid);
	const { mutate: liftSuspension, isPending: isLifting } = useLiftSuspension(uid);

	if (isLoading) return <LoadingIndicator />;
	if (!user) return <EmptyIndicator message="탈퇴했거나 존재하지 않는 유저입니다." />;

	const suspendUntil = user.report?.suspendUntil;

	const renderOauthIcon = () => {
		if (user.oauthType === 'naver') return <Naver style={styles.oauthIcon} />;
		if (user.oauthType === 'kakao') return <Kakao style={styles.oauthIcon} />;
		if (user.oauthType === 'google') return <Google style={styles.oauthIcon} />;
		return <Apple style={styles.appleIcon} />;
	};

	const onPressLiftSuspension = () => {
		Alert.alert('정지 해제', `${user.displayName}님의 정지를 해제할까요?`, [
			{ text: '취소', style: 'cancel' },
			{ text: '확인', style: 'destructive', onPress: () => liftSuspension() },
		]);
	};

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
			<ProfileBox
				profileInfo={user}
				isMyProfile={false}
				openEditProfileModal={noop}
				openImageViewerModal={noop}
			/>

			<View style={styles.section}>
				<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
					계정
				</Text>
				<InfoRow
					borderRound="top"
					label="로그인 방식"
					value={
						<View style={styles.oauthValue}>
							{renderOauthIcon()}
							<Text variant="body1" color="secondary">
								{OAUTH_LABELS[user.oauthType] ?? user.oauthType}
							</Text>
						</View>
					}
				/>
				<InfoRow label="이메일" value={user.email || '-'} />
				<InfoRow
					label="가입일"
					value={user.createdAt ? formatKstDate(user.createdAt.toDate()) : '-'}
				/>
				<InfoRow
					label="마지막 로그인"
					value={user.lastLogin ? formatKstDate(user.lastLogin.toDate()) : '-'}
				/>
				<InfoRow
					label="마지막 접속"
					value={user.lastActiveAt ? elapsedTime(user.lastActiveAt) : '-'}
				/>
				<InfoRow
					borderRound="bottom"
					label="푸시 알림"
					value={
						user.pushToken ? (
							<Badge text="수신 가능" tone="green" />
						) : (
							<Badge text="수신 불가" tone="neutral" />
						)
					}
				/>
			</View>

			<View style={styles.section}>
				<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
					활동
				</Text>
				<StatStrip
					items={[
						{
							label: '게시글',
							value: formatCount(stats?.posts),
							icon: { name: 'article', tone: 'blue' },
						},
						{
							label: '댓글',
							value: formatCount(stats?.comments),
							icon: { name: 'mode-comment', tone: 'green' },
						},
						{
							label: '답글',
							value: formatCount(stats?.replies),
							icon: { name: 'reply', tone: 'lavender' },
						},
						{
							label: '채팅방',
							value: formatCount(stats?.chatRooms),
							icon: { name: 'forum', tone: 'primaryBrand' },
						},
						{
							label: '메시지',
							value: formatCount(stats?.messages),
							icon: { name: 'textsms', tone: 'primaryBrand' },
						},
					]}
				/>
				<ViewAllLink
					label="프로필 보기"
					onPress={() => navigateToUserProfile({ userId: uid })}
				/>
			</View>

			<View style={styles.section}>
				<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
					거래 리뷰
				</Text>
				<StatStrip
					items={[
						{ label: '받은 리뷰', value: formatCount(user.review?.total ?? 0) },
						{
							label: '만족',
							value: formatCount(user.review?.positive ?? 0),
							inlineIcon: (
								<FontAwesome6
									name="smile-beam"
									size={18}
									color={colors.icon.green}
								/>
							),
						},
						{
							label: '불만족',
							value: formatCount(user.review?.negative ?? 0),
							inlineIcon: (
								<FontAwesome6 name="frown-open" size={18} color={colors.icon.red} />
							),
						},
					]}
				/>
			</View>

			<View style={styles.section}>
				<View style={[styles.titleRow, styles.sectionTitle]}>
					<Text variant="body1" weight="semibold">
						신고 · 차단
					</Text>
					{user.report?.needsAdminReview && <Badge text="검토 필요" tone="orange" />}
				</View>
				<StatStrip
					items={[
						{
							label: '받은 신고',
							value: formatCount(user.report?.total ?? 0),
							valueTone: 'danger',
						},
						{ label: '접수한 신고', value: formatCount(stats?.reportsFiled) },
						{
							label: '차단당함',
							value: formatCount(stats?.blockedBy),
							valueTone: 'danger',
						},
						{ label: '차단함', value: formatCount(stats?.blocking) },
					]}
				/>
				{isSuspended(suspendUntil) && (
					<View style={styles.actionPanel}>
						<DangerActionPanel
							actions={[
								{
									title: '계정 정지',
									description: `${formatKstMonthDay(suspendUntil.toDate())} 0시까지 정지 중`,
									actionLabel: '정지 해제',
									variant: 'dangerOutline',
									isLoading: isLifting,
									onPress: onPressLiftSuspension,
								},
							]}
						/>
					</View>
				)}
			</View>
		</ScrollView>
	);
};

export default AdminUserDetail;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			padding: PADDING,
			paddingBottom: Spacing.xxxl,
		},
		section: {
			marginTop: Spacing.xxxl,
		},
		sectionTitle: {
			marginBottom: Spacing.l,
		},
		titleRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		oauthValue: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		oauthIcon: {
			width: 16,
			height: 16,
		},
		appleIcon: {
			width: 14,
			height: 14,
		},
		actionPanel: {
			marginTop: Spacing.m,
		},
	});
