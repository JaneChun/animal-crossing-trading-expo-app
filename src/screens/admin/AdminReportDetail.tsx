import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import AvatarPair from '@/components/Admin/AvatarPair';
import ContentTypeChip from '@/components/Admin/ContentTypeChip';
import DangerActionPanel, { DangerAction } from '@/components/Admin/DangerActionPanel';
import { getReportCategoryBadge, getReportContentType } from '@/components/Admin/reportMeta';
import StatTile from '@/components/Admin/StatTile';
import SummaryLinkCard from '@/components/Admin/SummaryLinkCard';
import { isSuspended } from '@/components/Admin/SuspensionBadge';
import UserRow from '@/components/Admin/UserRow';
import CommunityTypeBadge from '@/components/Community/CommunityTypeBadge';
import MarketTypeBadge from '@/components/Home/MarketTypeBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { ReportTargetContent } from '@/firebase/services/adminService';
import { useLiftSuspension } from '@/hooks/admin/mutation/useLiftSuspension';
import { useSetCommentHidden } from '@/hooks/admin/mutation/useSetCommentHidden';
import { useSetPostHidden } from '@/hooks/admin/mutation/useSetPostHidden';
import { useSetReportResolved } from '@/hooks/admin/mutation/useSetReportResolved';
import { useAdminReport, useReportTargetContent } from '@/hooks/admin/query/useAdminReport';
import { useAdminUserInfo } from '@/hooks/admin/query/useAdminUserInfo';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { ColorScheme } from '@/theme/Color';
import { AdminReportDetailRouteProp } from '@/types/navigation';
import { Collection } from '@/types/post';
import { Report } from '@/types/report';
import { UserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { formatKstDateTime, formatKstMonthDay } from '@/utilities/kstDate';
import {
	navigateToAdminChatViewer,
	navigateToAdminUserDetail,
	navigateToPost,
	navigateToUserProfile,
} from '@/utilities/navigationHelpers';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

const TARGET_SECTION_TITLES = {
	post: '신고된 게시글',
	comment: '신고된 댓글',
	reply: '신고된 답글',
	chat: '신고된 채팅',
	profile: '신고된 프로필',
} as const;

// 원문이 일반 유저에게 보이지 않는 상태일 때 링크 아래에 표시한다
const POST_STATUS_NOTICES = {
	hidden: '일반 유저에게 숨겨진 게시글입니다.',
	deleted: '작성자가 삭제한 게시글입니다. 삭제 30일 후 영구 삭제됩니다.',
} as const;

// 최근 30일 신고 수 위험도: 7회 이상은 30일 정지 기준, 3회 이상은 주의
const getRecentReportColor = (recent30Days: number): keyof ColorScheme['text'] => {
	if (recent30Days >= 7) return 'danger';
	if (recent30Days >= 3) return 'orange';
	return 'primary';
};

const AdminReportDetail = () => {
	const { params } = useRoute<AdminReportDetailRouteProp>();

	return (
		<AdminGuard>
			<ReportDetailContent reportId={params.reportId} />
		</AdminGuard>
	);
};

const ReportDetailContent = ({ reportId }: { reportId: string }) => {
	const styles = useThemedStyles(makeStyles);
	const { data: report, isLoading } = useAdminReport(reportId);
	const { data: reporter } = useAdminUserInfo(report?.reporterId);
	const { data: reportee, isLoading: isReporteeLoading } = useAdminUserInfo(report?.reporteeId);
	const { data: target } = useReportTargetContent(report);
	const { mutate: setResolved, isPending: isResolving } = useSetReportResolved(reportId);

	if (isLoading) return <LoadingIndicator />;
	if (!report) return <EmptyIndicator message="신고를 찾을 수 없습니다." />;

	const categoryBadge = getReportCategoryBadge(report.category);
	// 탈퇴한 유저는 Users 문서가 없으므로 기본 유저 정보로 표시한다
	const reporterDisplay = reporter ?? getDefaultUserInfo(report.reporterId);
	const reporteeDisplay = reportee ?? getDefaultUserInfo(report.reporteeId);

	return (
		<View style={styles.screen}>
			<ScrollView>
				<View style={styles.summarySection}>
					<View style={styles.row}>
						<Badge text={categoryBadge.text} tone={categoryBadge.tone} />
						<ContentTypeChip type={getReportContentType(report)} />
					</View>
					<Text variant="caption" color="tertiary">
						{formatKstDateTime(report.createdAt.toDate())}
					</Text>
					<Text
						variant="body1"
						color={report.detail ? 'secondary' : 'tertiary'}
						style={styles.detail}
					>
						{report.detail || '상세 내용 없음'}
					</Text>
				</View>

				<Divider variant="section" />
				<View style={styles.section}>
					<Text variant="body1" weight="semibold">
						신고자
					</Text>
					<UserRow
						user={reporterDisplay}
						onPress={
							reporter
								? () => navigateToAdminUserDetail({ uid: report.reporterId })
								: undefined
						}
						right={reporter ? <Chevron /> : undefined}
					/>
				</View>

				<Divider variant="section" />
				<View style={styles.section}>
					<Text variant="body1" weight="semibold">
						피신고자
					</Text>
					<UserRow
						user={reporteeDisplay}
						onPress={
							reportee
								? () => navigateToAdminUserDetail({ uid: report.reporteeId })
								: undefined
						}
						right={reportee ? <Chevron /> : undefined}
					/>
					{reportee && (
						<View style={styles.tiles}>
							<StatTile
								label="누적 신고"
								value={reportee.report?.total ?? 0}
								unit="건"
							/>
							<StatTile
								label="최근 30일"
								value={reportee.report?.recent30Days ?? 0}
								unit="건"
								valueTone={getRecentReportColor(reportee.report?.recent30Days ?? 0)}
							/>
						</View>
					)}
				</View>

				<Divider variant="section" />
				<ReportTargetSection
					report={report}
					target={target}
					reporter={reporterDisplay}
					reportee={reporteeDisplay}
				/>

				<ReportActionsSection
					report={report}
					target={target}
					reportee={reportee}
					isReporteeLoading={isReporteeLoading}
				/>
			</ScrollView>

			<View style={styles.footer}>
				{report.resolved ? (
					<Button
						size="lg"
						variant="secondary"
						isLoading={isResolving}
						onPress={() => setResolved(false)}
					>
						미처리로 되돌리기
					</Button>
				) : (
					<Button size="lg" isLoading={isResolving} onPress={() => setResolved(true)}>
						처리 완료
					</Button>
				)}
			</View>
		</View>
	);
};

const Chevron = () => {
	const { colors } = useTheme();
	return <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />;
};

type ReportTargetSectionProps = {
	report: Report;
	target: ReportTargetContent | undefined;
	reporter: Pick<UserInfo, 'displayName' | 'photoURL'>;
	reportee: Pick<UserInfo, 'displayName' | 'photoURL'>;
};

// 신고 당시 내용(스냅샷)과 원문·대화·프로필 이동
const ReportTargetSection = ({ report, target, reporter, reportee }: ReportTargetSectionProps) => {
	const styles = useThemedStyles(makeStyles);
	const contentType = getReportContentType(report);
	const participantNames = `${reporter.displayName} · ${reportee.displayName}`;

	const renderLink = () => {
		if (contentType === 'chat') {
			return (
				<SummaryLinkCard
					left={<AvatarPair photoURLs={[reporter.photoURL, reportee.photoURL]} />}
					title={participantNames}
					onPress={() =>
						navigateToAdminChatViewer({
							chatId: report.chatId!,
							reporterId: report.reporterId,
							reporteeId: report.reporteeId,
						})
					}
				/>
			);
		}

		if (contentType === 'profile') {
			return (
				<SummaryLinkCard
					left={<AvatarPair photoURLs={[reportee.photoURL, undefined]} />}
					title={reportee.displayName}
					onPress={() => navigateToUserProfile({ userId: report.reporteeId })}
				/>
			);
		}

		// 원문 조회 중
		if (!target) return null;

		const { post, collectionName } = target;

		// 영구 삭제(삭제 30일 후)되었거나 컬렉션을 찾지 못한 기존 신고
		if (!post || !collectionName) {
			return (
				<Text variant="body2" color="tertiary">
					원문을 찾을 수 없습니다.
				</Text>
			);
		}

		// 관리자는 숨김·삭제된 게시글도 상세로 볼 수 있다
		return (
			<>
				<SummaryLinkCard
					left={<PostTypeBadge post={post} collectionName={collectionName} />}
					title={post.title}
					onPress={() => navigateToPost({ postId: post.id, collectionName })}
				/>
				{post.status !== 'active' && (
					<Text variant="body2" color="tertiary">
						{POST_STATUS_NOTICES[post.status]}
					</Text>
				)}
			</>
		);
	};

	const snapshotLines = report.snapshot
		? [report.snapshot.title, report.snapshot.body].filter(Boolean)
		: [];
	const hasSnapshotArea = contentType !== 'chat' && contentType !== 'profile';

	return (
		<View style={[styles.section, styles.targetSection]}>
			<Text variant="body1" weight="semibold">
				{TARGET_SECTION_TITLES[contentType]}
			</Text>
			{hasSnapshotArea && (
				<Text variant="body1" color={snapshotLines.length ? 'primary' : 'tertiary'}>
					{snapshotLines.length ? snapshotLines.join('\n') : '신고 시점 내용 없음'}
				</Text>
			)}
			{renderLink()}
		</View>
	);
};

const PostTypeBadge = ({
	post,
	collectionName,
}: {
	post: NonNullable<ReportTargetContent['post']>;
	collectionName: Collection;
}) => {
	if (isBoardPost(post, collectionName)) return <MarketTypeBadge type={post.type} />;
	if (isCommunityPost(post, collectionName)) return <CommunityTypeBadge type={post.type} />;
	return null;
};

type ReportActionsSectionProps = {
	report: Report;
	target: ReportTargetContent | undefined;
	reportee: UserInfo | null | undefined;
	isReporteeLoading: boolean;
};

// 정지 해제, 게시글·댓글 숨김. 할 수 있는 조치가 없으면 섹션을 그리지 않는다
const ReportActionsSection = ({
	report,
	target,
	reportee,
	isReporteeLoading,
}: ReportActionsSectionProps) => {
	const styles = useThemedStyles(makeStyles);
	const contentType = getReportContentType(report);
	const collectionName = target?.collectionName ?? 'Boards';
	const postId = report.postId ?? '';
	const commentId = report.commentId ?? '';

	const { mutate: liftSuspension, isPending: isLifting } = useLiftSuspension(report.reporteeId);
	const { mutate: setPostHidden, isPending: isPostPending } = useSetPostHidden({
		reportId: report.id,
		collectionName,
		postId,
	});
	const { mutate: setCommentHidden, isPending: isCommentPending } = useSetCommentHidden({
		reportId: report.id,
		collectionName,
		postId,
		commentId,
	});

	const confirm = (title: string, message: string, onConfirm: () => void) => {
		Alert.alert(title, message, [
			{ text: '취소', style: 'cancel' },
			{ text: '확인', style: 'destructive', onPress: onConfirm },
		]);
	};

	const actions: DangerAction[] = [];

	const suspendUntil = reportee?.report?.suspendUntil;
	if (!isReporteeLoading && reportee && isSuspended(suspendUntil)) {
		actions.push({
			title: '계정 정지',
			description: `${formatKstMonthDay(suspendUntil.toDate())} 0시까지 정지 중`,
			actionLabel: '정지 해제',
			variant: 'dangerOutline',
			isLoading: isLifting,
			onPress: () =>
				confirm('정지 해제', `${reportee.displayName}님의 정지를 해제할까요?`, () =>
					liftSuspension(),
				),
		});
	}

	const post = target?.post;
	if (contentType === 'post' && post && post.status !== 'deleted') {
		const isHiddenByAdmin = !!post.hiddenByAdmin;
		actions.push({
			title: isHiddenByAdmin ? '게시글 숨김 중' : '게시글 숨기기',
			description: isHiddenByAdmin
				? '관리자가 숨긴 게시글입니다'
				: '목록과 상세에서 보이지 않습니다',
			actionLabel: isHiddenByAdmin ? '숨김 해제' : '숨기기',
			variant: isHiddenByAdmin ? 'dangerOutline' : 'danger',
			isLoading: isPostPending,
			onPress: () =>
				isHiddenByAdmin
					? setPostHidden(false)
					: confirm('게시글 숨기기', '이 게시글을 숨길까요?', () => setPostHidden(true)),
		});
	}

	const comment = target?.comment;
	if (contentType === 'comment' && comment) {
		const isHiddenByAdmin = !!comment.hiddenByAdmin;
		actions.push({
			title: isHiddenByAdmin ? '댓글 숨김 중' : '댓글 숨기기',
			description: isHiddenByAdmin
				? '관리자가 숨긴 댓글입니다'
				: '답글도 함께 보이지 않습니다',
			actionLabel: isHiddenByAdmin ? '숨김 해제' : '숨기기',
			variant: isHiddenByAdmin ? 'dangerOutline' : 'danger',
			isLoading: isCommentPending,
			onPress: () =>
				isHiddenByAdmin
					? setCommentHidden(false)
					: confirm('댓글 숨기기', '이 댓글과 답글을 숨길까요?', () =>
							setCommentHidden(true),
						),
		});
	}

	if (actions.length === 0) return null;

	return (
		<>
			<Divider variant="section" />
			<View style={[styles.section, styles.actionsSection]}>
				<Text variant="body1" weight="semibold" style={styles.actionsTitle}>
					조치
				</Text>
				<DangerActionPanel actions={actions} />
			</View>
		</>
	);
};

export default AdminReportDetail;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		summarySection: {
			padding: PADDING,
			gap: Spacing.s,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
		},
		detail: {
			marginTop: Spacing.s,
		},
		section: {
			paddingTop: Spacing.l,
			paddingBottom: Spacing.xl,
			paddingHorizontal: PADDING,
		},
		tiles: {
			flexDirection: 'row',
			gap: Spacing.s,
		},
		targetSection: {
			gap: Spacing.m,
			paddingBottom: PADDING,
		},
		actionsSection: {
			paddingBottom: PADDING,
		},
		actionsTitle: {
			marginBottom: Spacing.l,
		},
		footer: {
			paddingTop: Spacing.m,
			paddingHorizontal: PADDING,
			paddingBottom: PADDING,
			borderTopWidth: 1,
			borderTopColor: colors.border.default,
		},
	});
