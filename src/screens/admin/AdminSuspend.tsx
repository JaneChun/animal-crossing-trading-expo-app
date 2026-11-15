import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdminGuard from '@/components/Admin/AdminGuard';
import ReportListItem from '@/components/Admin/ReportListItem';
import ViolationTypeList from '@/components/Admin/ViolationTypeList';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import { PADDING } from '@/components/ui/layout/Layout';
import InlineLoadingIndicator from '@/components/ui/loading/InlineLoadingIndicator';
import Text from '@/components/ui/Text';
import { SANCTION_KINDS } from '@/constants/sanction';
import { useIssueSanction } from '@/hooks/admin/mutation/useIssueSanction';
import { useSanctionRecommendation } from '@/hooks/admin/query/useSanctionRecommendation';
import { useUnresolvedReceivedReports } from '@/hooks/admin/query/useUnresolvedReceivedReports';
import { goBack } from '@/navigation/RootNavigation';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { AdminSuspendRouteProp } from '@/types/navigation';
import { Report } from '@/types/report';
import { IssueSanctionRequest, SanctionKind, ViolationType } from '@/types/sanction';

type SuspensionKind = Exclude<SanctionKind, 'warning'>;

const PERIOD_OPTIONS: { kind: SuspensionKind; label: string }[] = [
	{ kind: 'days7', label: '7일' },
	{ kind: 'days30', label: '30일' },
	{ kind: 'permanent', label: '영구' },
];

// '대상 없음': 신고 없이 운영자가 직접 처분한다. 대상 없이 경고·정지하고 신고를 연결하지 않는다
const NO_TARGET = 'none';

const getKindLabel = (kind: SanctionKind) => SANCTION_KINDS.find(({ EN }) => EN === kind)?.KR ?? '';

// 고른 신고의 대상이 경고·정지 대상이 된다. 고른 신고와 대상이 같은 미처리 신고는 issueSanction 함수가 찾아 함께 처리 완료한다
const toSanctionTarget = (report: Report): IssueSanctionRequest['target'] => {
	const { collectionName, postId, commentId, replyId, chatId } = report;
	const targetEntries = Object.entries({ collectionName, postId, commentId, replyId, chatId });
	const definedEntries = targetEntries.filter(([, value]) => value !== undefined);
	return definedEntries.length > 0 ? Object.fromEntries(definedEntries) : undefined;
};

const AdminSuspend = () => {
	const { params } = useRoute<AdminSuspendRouteProp>();
	const navigation = useNavigation();
	const isWarning = !!params.isWarning;

	useEffect(() => {
		navigation.setOptions({ title: isWarning ? '경고' : '계정 정지' });
	}, [navigation, isWarning]);

	return (
		<AdminGuard>
			<SuspendContent
				uid={params.uid}
				initialReportId={params.reportId}
				isWarning={isWarning}
			/>
		</AdminGuard>
	);
};

type SuspendContentProps = {
	uid: string;
	initialReportId?: string;
	isWarning: boolean;
};

// 계정 정지: 위반 유형 → 근거 신고('대상 없음' + 받은 미처리 신고) → 정지 기간 → [{기간} 정지하기]
// 경고: 정지 기간 없이 위반 유형 → 근거 신고 → [경고하기]
const SuspendContent = ({ uid, initialReportId, isWarning }: SuspendContentProps) => {
	const styles = useThemedStyles(makeStyles);
	const [violationType, setViolationType] = useState<ViolationType | null>(null);
	const [pickedReportId, setPickedReportId] = useState<string | null>(initialReportId ?? null);
	const [chosenKind, setChosenKind] = useState<SuspensionKind | null>(null);

	const { data: reports, isLoading: isReportsLoading } = useUnresolvedReceivedReports(uid);
	const { data: recommendation, isFetching: isRecommendationFetching } =
		useSanctionRecommendation(uid, !isWarning);
	const { mutate: issueSanction, isPending } = useIssueSanction(uid);

	// 권장이 경고(1회째)면 기간 선택지에 없으므로 가장 짧은 7일을 기본으로 둔다
	const recommendedKind = recommendation?.recommendedKind;
	const defaultKind: SuspensionKind =
		recommendedKind && recommendedKind !== 'warning' ? recommendedKind : 'days7';
	const selectedKind = chosenKind ?? defaultKind;
	const selectedPeriodLabel = PERIOD_OPTIONS.find(({ kind }) => kind === selectedKind)?.label;

	const submit = () => {
		if (!violationType || !pickedReportId) return;
		const pickedReport = reports?.find(({ id }) => id === pickedReportId);
		const target = pickedReport ? toSanctionTarget(pickedReport) : undefined;
		const kind = isWarning ? 'warning' : selectedKind;
		issueSanction(
			{ kind, violationType, target, reportId: pickedReport?.id },
			{ onSuccess: goBack },
		);
	};
	const submitLabel = isWarning ? '경고하기' : `${selectedPeriodLabel} 정지하기`;

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<ScrollView>
				<View style={styles.section}>
					<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
						위반 유형
					</Text>
					<ViolationTypeList selected={violationType} onSelect={setViolationType} />
				</View>

				<Divider variant="section" />
				<View style={styles.section}>
					<Text variant="body1" weight="semibold">
						근거 신고
					</Text>
					<Text variant="caption" color="tertiary" style={styles.description}>
						{`고른 신고의 대상이 ${isWarning ? '경고' : '정지'} 사유로 표시되고, 같은 대상의 미처리 신고는 함께 처리 완료됩니다.`}
					</Text>
					<View style={styles.reportList}>
						<Pressable
							style={styles.reportOption}
							onPress={() => setPickedReportId(NO_TARGET)}
						>
							<PickCheckbox isPicked={pickedReportId === NO_TARGET} />
							<Text variant="body1">대상 없음</Text>
						</Pressable>
						{isReportsLoading && <InlineLoadingIndicator />}
						{reports?.map((report) => (
							<Pressable
								key={report.id}
								style={[styles.reportOption, styles.reportOptionTop]}
								onPress={() => setPickedReportId(report.id)}
							>
								<PickCheckbox isPicked={pickedReportId === report.id} />
								<View style={styles.reportContent}>
									<ReportListItem
										report={report}
										onPress={() => setPickedReportId(report.id)}
										style={styles.reportItem}
									/>
								</View>
							</Pressable>
						))}
					</View>
				</View>

				{!isWarning && (
					<>
						<Divider variant="section" />
						<View style={styles.section}>
							<Text variant="body1" weight="semibold" style={styles.legend}>
								정지 기간
							</Text>
							<View style={styles.segment}>
								{PERIOD_OPTIONS.map(({ kind, label }) => {
									const isSelected = kind === selectedKind;
									return (
										<Pressable
											key={kind}
											style={[
												styles.segmentItem,
												isSelected && styles.segmentItemSelected,
											]}
											onPress={() => setChosenKind(kind)}
										>
											<Text
												variant="body2"
												weight="semibold"
												color={isSelected ? 'primary' : 'tertiary'}
											>
												{label}
											</Text>
										</Pressable>
									);
								})}
							</View>
							{recommendation && recommendedKind && (
								<Text
									variant="caption"
									color="tertiary"
									style={styles.recommendation}
								>
									{`최근 90일 위반 ${recommendation.recentActiveCount + 1}회째로, 정책상 ${getKindLabel(recommendedKind)}를 권장합니다.`}
								</Text>
							)}
						</View>
					</>
				)}
			</ScrollView>

			<View style={styles.footer}>
				<Button
					variant="danger"
					size="lg"
					// 권장 조치가 도착하면 기본 기간이 바뀌므로, 최신 권장을 받기 전에는 정지할 수 없게 한다
					disabled={!violationType || !pickedReportId || isRecommendationFetching}
					isLoading={isPending}
					onPress={submit}
				>
					{submitLabel}
				</Button>
			</View>
		</SafeAreaView>
	);
};

// 근거 신고는 하나만 고른다. 체크 표시로 고른 행을 보여 준다
const PickCheckbox = ({ isPicked }: { isPicked: boolean }) => {
	const styles = useThemedStyles(makeStyles);
	return (
		<Ionicons
			name={isPicked ? 'checkbox' : 'square-outline'}
			size={24}
			color={isPicked ? styles.checkboxPicked.color : styles.checkbox.color}
		/>
	);
};

export default AdminSuspend;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		section: {
			paddingTop: Spacing.l,
			paddingBottom: PADDING,
			paddingHorizontal: PADDING,
		},
		sectionTitle: {
			marginBottom: Spacing.l,
		},
		description: {
			marginTop: Spacing.xs,
		},
		reportList: {
			marginTop: Spacing.s,
			gap: 10,
		},
		reportOption: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			padding: Spacing.m,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		reportOptionTop: {
			alignItems: 'flex-start',
		},
		reportContent: {
			flex: 1,
		},
		reportItem: {
			paddingVertical: 0,
			borderBottomWidth: 0,
		},
		checkbox: {
			color: colors.border.default,
		},
		checkboxPicked: {
			color: colors.brand.primary,
		},
		legend: {
			marginBottom: Spacing.m,
		},
		segment: {
			flexDirection: 'row',
			gap: Spacing.xs,
			padding: Spacing.xs,
			borderRadius: 10,
			backgroundColor: colors.bg.fill,
		},
		segmentItem: {
			flex: 1,
			height: 36,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		segmentItemSelected: {
			backgroundColor: colors.bg.elevated,
		},
		recommendation: {
			marginTop: Spacing.s,
		},
		footer: {
			paddingTop: Spacing.m,
			paddingHorizontal: PADDING,
			paddingBottom: Spacing.s,
			borderTopWidth: 1,
			borderTopColor: colors.border.default,
		},
	});
