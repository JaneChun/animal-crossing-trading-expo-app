import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import Text from '@/components/ui/Text';
import { SANCTION_KINDS, VIOLATION_TYPES } from '@/constants/sanction';
import { useIssueSanction } from '@/hooks/admin/mutation/useIssueSanction';
import { useSanctionRecommendation } from '@/hooks/admin/query/useSanctionRecommendation';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { SanctionKind, ViolationType } from '@/types/sanction';

import ViolationTypeList from './ViolationTypeList';

type SuspensionKind = Exclude<SanctionKind, 'warning'>;

const PERIOD_OPTIONS: { kind: SuspensionKind; label: string }[] = [
	{ kind: 'days7', label: '7일' },
	{ kind: 'days30', label: '30일' },
	{ kind: 'permanent', label: '영구' },
];

const getKindLabel = (kind: SanctionKind) => SANCTION_KINDS.find(({ EN }) => EN === kind)?.KR ?? '';

type SuspendSheetProps = {
	isVisible: boolean;
	onClose: () => void;
	userId: string;
};

// 관리자 계정 정지. 메인 단계에서 '위반 유형' 행을 누르면 유형 선택 단계로 넘어간다
const SuspendSheet = ({ isVisible, onClose, userId }: SuspendSheetProps) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const [step, setStep] = useState<'main' | 'type'>('main');
	const [violationType, setViolationType] = useState<ViolationType | null>(null);
	const [draftViolationType, setDraftViolationType] = useState<ViolationType | null>(null);
	const [chosenKind, setChosenKind] = useState<SuspensionKind | null>(null);

	const { data: recommendation, isFetching: isRecommendationFetching } =
		useSanctionRecommendation(userId, isVisible);
	const { mutate: issueSanction, isPending } = useIssueSanction(userId);

	// 권장이 경고(1회째)면 기간 선택지에 없으므로 가장 짧은 7일을 기본으로 둔다
	const recommendedKind = recommendation?.recommendedKind;
	const defaultKind: SuspensionKind =
		recommendedKind && recommendedKind !== 'warning' ? recommendedKind : 'days7';
	const selectedKind = chosenKind ?? defaultKind;
	const selectedPeriodLabel = PERIOD_OPTIONS.find(({ kind }) => kind === selectedKind)?.label;
	const violationLabel = VIOLATION_TYPES.find(({ EN }) => EN === violationType)?.KR;

	const resetAndClose = () => {
		setStep('main');
		setViolationType(null);
		setDraftViolationType(null);
		setChosenKind(null);
		onClose();
	};

	const openTypeStep = () => {
		setDraftViolationType(violationType);
		setStep('type');
	};

	const completeTypeStep = () => {
		setViolationType(draftViolationType);
		setStep('main');
	};

	const submit = () => {
		if (!violationType) return;
		issueSanction(
			{ kind: selectedKind, violationType, reportIds: [] },
			{ onSuccess: resetAndClose },
		);
	};

	const isTypeStep = step === 'type';

	// 단계마다 시트를 새로 그리면 열림 애니메이션이 다시 나오므로, 시트 하나에서 제목·버튼·내용만 바꾼다
	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={resetAndClose}
			title={isTypeStep ? '위반 유형' : '계정 정지'}
			snapPoints={['75%']}
			leftButton={
				isTypeStep ? (
					<Button variant="secondary" size="md" onPress={() => setStep('main')}>
						이전
					</Button>
				) : null
			}
			rightButton={
				isTypeStep ? (
					<Button
						variant="outline"
						size="md"
						disabled={!draftViolationType}
						onPress={completeTypeStep}
					>
						완료
					</Button>
				) : null
			}
		>
			{isTypeStep ? (
				<ViolationTypeList selected={draftViolationType} onSelect={setDraftViolationType} />
			) : (
				<View style={styles.body}>
					<Pressable style={styles.typeRow} onPress={openTypeStep}>
						<Text variant="body1">위반 유형</Text>
						<View style={styles.typeValue}>
							{!!violationLabel && (
								<Text variant="body1" color="secondary">
									{violationLabel}
								</Text>
							)}
							<Ionicons
								name="chevron-forward"
								size={16}
								color={colors.text.tertiary}
							/>
						</View>
					</Pressable>

					<View>
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
							<Text variant="caption" color="tertiary" style={styles.recommendation}>
								{`최근 90일 위반 ${recommendation.recentActiveCount + 1}회째로, 정책상 ${getKindLabel(recommendedKind)}를 권장합니다.`}
							</Text>
						)}
					</View>

					<Button
						variant="danger"
						size="lg"
						// 권장 조치가 도착하면 기본 기간이 바뀌므로, 최신 권장을 받기 전에는 정지할 수 없게 한다
						disabled={!violationType || isRecommendationFetching}
						isLoading={isPending}
						onPress={submit}
					>
						{`${selectedPeriodLabel} 정지하기`}
					</Button>
				</View>
			)}
		</CustomBottomSheet>
	);
};

export default SuspendSheet;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		body: {
			gap: Spacing.xl,
		},
		typeRow: {
			padding: Spacing.l,
			borderRadius: 10,
			backgroundColor: colors.bg.fill,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			gap: Spacing.m,
		},
		typeValue: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xxs,
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
	});
