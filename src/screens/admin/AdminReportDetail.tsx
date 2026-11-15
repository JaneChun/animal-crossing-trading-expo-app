import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import AvatarPair from '@/components/Admin/AvatarPair';
import BasisReportsSection from '@/components/Admin/BasisReportsSection';
import ContentTypeChip, { ContentType } from '@/components/Admin/ContentTypeChip';
import DangerActionPanel, { DangerAction } from '@/components/Admin/DangerActionPanel';
import { getReportCategoryBadge, getReportContentType } from '@/components/Admin/reportMeta';
import SanctionListItem from '@/components/Admin/SanctionListItem';
import StatTile from '@/components/Admin/StatTile';
import SummaryLinkCard from '@/components/Admin/SummaryLinkCard';
import UserRow from '@/components/Admin/UserRow';
import PostSummary from '@/components/Chat/PostSummary';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { ReportTargetContent } from '@/firebase/services/adminService';
import { useSetCommentHidden } from '@/hooks/admin/mutation/useSetCommentHidden';
import { useSetPostHidden } from '@/hooks/admin/mutation/useSetPostHidden';
import { useSetReportResolved } from '@/hooks/admin/mutation/useSetReportResolved';
import { useAdminReport, useReportTargetContent } from '@/hooks/admin/query/useAdminReport';
import { useAdminSanction } from '@/hooks/admin/query/useAdminSanction';
import { useAdminUserInfo } from '@/hooks/admin/query/useAdminUserInfo';
import { useTargetReports } from '@/hooks/admin/query/useTargetReports';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { ColorScheme } from '@/theme/Color';
import { AdminReportDetailRouteProp } from '@/types/navigation';
import { Report } from '@/types/report';
import { UserInfo } from '@/types/user';
import { getDefaultUserInfo } from '@/utilities/getDefaultUserInfo';
import { formatKstDateTime } from '@/utilities/kstDate';
import {
	navigateToAdminChatViewer,
	navigateToAdminSuspend,
	navigateToAdminUserDetail,
	navigateToUserProfile,
} from '@/utilities/navigationHelpers';

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

// [경고] 행 설명. 게시글·댓글·답글은 숨기면서 경고하고, 채팅·프로필은 숨길 대상이 없어 경고만 기록한다
const WARNING_DESCRIPTIONS: Record<ContentType, string> = {
	post: '게시글을 숨기고 경고합니다',
	comment: '댓글을 숨기고 경고합니다',
	reply: '답글을 숨기고 경고합니다',
	chat: '경고합니다',
	profile: '경고합니다',
};

// 같은 대상의 미처리 신고 안내에 쓰는 대상 이름
const TARGET_NAMES: Record<ContentType, string> = {
	post: '게시글',
	comment: '댓글',
	reply: '답글',
	chat: '채팅',
	profile: '프로필',
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
	const { data: reportee } = useAdminUserInfo(report?.reporteeId);
	const { data: target } = useReportTargetContent(report);
	const { data: targetReports } = useTargetReports(report);
	const { data: linkedSanction } = useAdminSanction(report?.sanctionId ?? '');
	const { mutate: setResolved, isPending: isResolving } = useSetReportResolved(reportId);

	if (isLoading) return <LoadingIndicator />;
	if (!report) return <EmptyIndicator message="신고를 찾을 수 없습니다." />;

	const categoryBadge = getReportCategoryBadge(report.category);
	// 탈퇴한 유저는 Users 문서가 없으므로 기본 유저 정보로 표시한다
	const reporterDisplay = reporter ?? getDefaultUserInfo(report.reporterId);
	const reporteeDisplay = reportee ?? getDefaultUserInfo(report.reporteeId);

	const contentType = getReportContentType(report);

	const renderFooter = () => {
		if (!report.resolved) {
			return (
				<Button
					size="lg"
					variant="secondary"
					isLoading={isResolving}
					onPress={() => setResolved(true)}
				>
					조치 없이 처리 완료
				</Button>
			);
		}
		// 조치에 연결된 신고는 되돌리지 않는다. 되돌리려면 조치 상세에서 조치를 취소한다
		if (report.sanctionId) return null;
		return (
			<Button
				size="lg"
				variant="secondary"
				isLoading={isResolving}
				onPress={() => setResolved(false)}
			>
				미처리로 되돌리기
			</Button>
		);
	};
	const footer = renderFooter();

	return (
		<View style={styles.screen}>
			<ScrollView>
				<View style={styles.summarySection}>
					<View style={styles.row}>
						<Badge text={categoryBadge.text} tone={categoryBadge.tone} />
						<ContentTypeChip type={contentType} />
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

				{!report.resolved && !!targetReports?.length && (
					<>
						<Divider variant="section" />
						<View style={styles.section}>
							<BasisReportsSection
								reports={targetReports}
								description={`같은 ${TARGET_NAMES[contentType]}에 들어온 미처리 신고입니다. 조치하면 함께 처리 완료됩니다.`}
								currentReportId={report.id}
							/>
						</View>
					</>
				)}

				<ReportActionsSection report={report} target={target} />

				{report.resolved && linkedSanction && (
					<>
						<Divider variant="section" />
						<View style={styles.section}>
							<Text variant="body1" weight="semibold">
								연결된 조치
							</Text>
							<SanctionListItem sanction={linkedSanction} meta="stage" />
						</View>
					</>
				)}
			</ScrollView>

			{footer && <View style={styles.footer}>{footer}</View>}
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
				<PostSummary post={post} collectionName={collectionName} />
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

type ReportActionsSectionProps = {
	report: Report;
	target: ReportTargetContent | undefined;
};

// 미처리 신고: [경고] / [계정 정지]. 이번 기능 전에 조치 없이 관리자가 숨긴 글·댓글: [숨김 해제]
// 할 수 있는 조치가 없으면 섹션을 그리지 않는다
const ReportActionsSection = ({ report, target }: ReportActionsSectionProps) => {
	const styles = useThemedStyles(makeStyles);
	const contentType = getReportContentType(report);
	const collectionName = target?.collectionName ?? 'Boards';
	const postId = report.postId ?? '';
	const commentId = report.commentId ?? '';

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

	const actions: DangerAction[] = [];

	if (!report.resolved) {
		// 경고는 정지와 같은 화면에서 위반 유형과 근거 신고(지금 신고가 미리 선택됨)를 고른다
		actions.push({
			title: '경고',
			description: WARNING_DESCRIPTIONS[contentType],
			actionLabel: '경고',
			variant: 'danger',
			onPress: () =>
				navigateToAdminSuspend({
					uid: report.reporteeId,
					reportId: report.id,
					isWarning: true,
				}),
		});
		actions.push({
			title: '계정 정지',
			description: '기간을 정해 계정을 정지합니다',
			actionLabel: '정지',
			variant: 'danger',
			onPress: () => navigateToAdminSuspend({ uid: report.reporteeId, reportId: report.id }),
		});
	}

	// 조치로 숨긴 대상은 조치 상세의 [조치 취소]로 되돌린다. 조치가 없는 이전 숨김만 여기서 푼다
	const post = target?.post;
	if (
		!report.sanctionId &&
		contentType === 'post' &&
		post?.hiddenByAdmin &&
		post.status !== 'deleted'
	) {
		actions.push({
			title: '게시글 숨김 중',
			description: '관리자가 숨긴 게시글입니다',
			actionLabel: '숨김 해제',
			variant: 'dangerOutline',
			isLoading: isPostPending,
			onPress: () => setPostHidden(false),
		});
	}

	const comment = target?.comment;
	if (!report.sanctionId && contentType === 'comment' && comment?.hiddenByAdmin) {
		actions.push({
			title: '댓글 숨김 중',
			description: '관리자가 숨긴 댓글입니다',
			actionLabel: '숨김 해제',
			variant: 'dangerOutline',
			isLoading: isCommentPending,
			onPress: () => setCommentHidden(false),
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
