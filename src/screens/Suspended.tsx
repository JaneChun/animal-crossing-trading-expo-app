import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProgressSteps, { ProgressStep } from '@/components/Sanction/ProgressSteps';
import {
	AppealResultSection,
	AppealSection,
	SanctionSummarySection,
} from '@/components/Sanction/SanctionSections';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useMySanctions } from '@/hooks/sanction/query/useMySanctions';
import { resetTo } from '@/navigation/RootNavigation';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { Sanction } from '@/types/sanction';
import { formatKstDate } from '@/utilities/kstDate';
import { navigateToAppealForm, navigateToOperationPolicy } from '@/utilities/navigationHelpers';
import {
	canAppeal,
	findCurrentSuspension,
	getAppealDeadline,
	isPermanentSuspension,
	SUSPENSION_DAYS,
} from '@/utilities/sanction';

const REVIEW_DESCRIPTION = '보통 3일 안에 검토합니다';

// 이의 신청 상태에 따른 진행 단계: 신청 전 → 검토 중 → 결과 안내
const getProgressSteps = (sanction: Sanction): ProgressStep[] => {
	const appealStatus = sanction.appeal?.status;
	if (appealStatus === 'reviewed') {
		return [
			{ title: '조치', state: 'done' },
			{ title: '이의 신청', state: 'done' },
			{ title: '운영자 검토', state: 'done' },
			{ title: '결과 안내', state: 'done' },
		];
	}
	if (appealStatus === 'pending') {
		return [
			{ title: '조치', state: 'done' },
			{ title: '이의 신청', state: 'done' },
			{ title: '운영자 검토', description: REVIEW_DESCRIPTION, state: 'current' },
			{ title: '결과 안내', state: 'todo' },
		];
	}
	return [
		{ title: '조치', state: 'done' },
		{ title: '이의 신청', state: 'current' },
		{ title: '운영자 검토', description: REVIEW_DESCRIPTION, state: 'todo' },
		{ title: '결과 안내', state: 'todo' },
	];
};

// 정지 중인 사용자가 앱을 열면 이 화면만 보인다. 이의 신청과 로그아웃만 할 수 있다
const Suspended = () => {
	const styles = useThemedStyles(makeStyles);
	const userInfo = useUserInfo();
	const { data: sanctions, isLoading } = useMySanctions(userInfo?.uid);
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const appleLogout = useAuthStore((state) => state.appleLogout);
	const googleLogout = useAuthStore((state) => state.googleLogout);

	if (isLoading) return <LoadingIndicator />;

	const suspendUntil = userInfo?.report?.suspendUntil;
	const sanction = sanctions ? findCurrentSuspension(sanctions) : undefined;
	const isPermanent =
		sanction?.kind === 'permanent' || (!!suspendUntil && isPermanentSuspension(suspendUntil));
	const suspensionDays = sanction ? SUSPENSION_DAYS[sanction.kind] : undefined;

	const periodLine = suspensionDays
		? `운영 정책 위반으로 ${suspensionDays}일 동안 서비스를 이용할 수 없습니다.`
		: '운영 정책 위반으로 서비스를 이용할 수 없습니다.';
	const releaseLine =
		!isPermanent && suspendUntil
			? `\n${formatKstDate(suspendUntil.toDate())} 0시에 자동으로 해제됩니다.`
			: '';

	const appealDeadline = sanction ? getAppealDeadline(sanction) : null;
	const isAppealable = !!sanction && canAppeal(sanction);
	const appeal = sanction?.appeal;

	const onPressLogout = async () => {
		if (!userInfo) return;

		let isSuccess = false;
		if (userInfo.oauthType === 'kakao') isSuccess = await kakaoLogout();
		else if (userInfo.oauthType === 'naver') isSuccess = await naverLogout();
		else if (userInfo.oauthType === 'apple') isSuccess = await appleLogout();
		else if (userInfo.oauthType === 'google') isSuccess = await googleLogout();

		if (isSuccess) resetTo('MainTab');
	};

	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.heading}>
					<Badge text="계정 이용 제한 안내" tone="danger" containerStyle={styles.chip} />
					<Text variant="title" weight="bold">
						계정 이용이 제한되었습니다
					</Text>
					<Text variant="body2" color="secondary">
						{periodLine + releaseLine}
					</Text>
				</View>

				{sanction && <SanctionSummarySection sanction={sanction} />}

				<View style={styles.notice}>
					{isAppealable && appealDeadline && (
						<>
							<Text variant="caption" color="tertiary" style={styles.centerText}>
								{`조치에 동의하지 않으면 ${formatKstDate(appealDeadline)}까지 이의를 신청할 수 있습니다.`}
							</Text>
							<Text variant="caption" color="tertiary" style={styles.centerText}>
								이의 신청은 조치 1건당 한 번만 보낼 수 있습니다.
							</Text>
						</>
					)}
					<Pressable onPress={navigateToOperationPolicy}>
						<Text variant="caption" color="primaryBrand">
							운영 정책 보기
						</Text>
					</Pressable>
				</View>

				{sanction && (
					<View>
						<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
							진행 상황
						</Text>
						<ProgressSteps steps={getProgressSteps(sanction)} />
					</View>
				)}

				{appeal && <AppealSection appeal={appeal} />}
				{appeal && <AppealResultSection appeal={appeal} />}
			</ScrollView>

			<View style={styles.footer}>
				{isAppealable && sanction && (
					<Button size="lg" onPress={() => navigateToAppealForm(sanction.id)}>
						이의 신청
					</Button>
				)}
				{appeal && (
					<Button size="lg" disabled onPress={() => {}}>
						이의 신청 완료
					</Button>
				)}
				<Button variant="ghost" size="md" isLoading={isAuthLoading} onPress={onPressLogout}>
					로그아웃
				</Button>
			</View>
		</SafeAreaView>
	);
};

export default Suspended;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
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
		sectionTitle: {
			marginBottom: Spacing.l,
		},
		notice: {
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
