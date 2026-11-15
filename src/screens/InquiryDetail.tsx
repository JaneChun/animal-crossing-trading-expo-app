import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PolicyCard from '@/components/Sanction/PolicyCard';
import {
	AppealResultSection,
	AppealSection,
	SanctionSummarySection,
} from '@/components/Sanction/SanctionSections';
import Button from '@/components/ui/Button';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { useMySanctions } from '@/hooks/sanction/query/useMySanctions';
import { useUserInfo } from '@/stores/auth';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { InquiryDetailRouteProp } from '@/types/navigation';
import { navigateToAppealForm } from '@/utilities/navigationHelpers';
import { canAppeal } from '@/utilities/sanction';

// 문의 내역 상세: 정지 화면과 같은 섹션으로 조치 내용·이의 신청·결과 안내를 보여 주고,
// 이의 신청 전에 규칙을 다시 볼 수 있게 위반 유형의 정책 카드를 함께 보여 준다
const InquiryDetail = () => {
	const styles = useThemedStyles(makeStyles);
	const { params } = useRoute<InquiryDetailRouteProp>();
	const userInfo = useUserInfo();
	const { data: sanctions, isLoading } = useMySanctions(userInfo?.uid);

	if (isLoading) return <LoadingIndicator />;

	const sanction = sanctions?.find(({ id }) => id === params.sanctionId);
	if (!sanction) return <EmptyIndicator message="문의 내역이 없습니다." />;

	const appeal = sanction.appeal;

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<ScrollView contentContainerStyle={styles.content}>
				<SanctionSummarySection sanction={sanction} />
				<PolicyCard violationType={sanction.violationType} />
				{appeal && <AppealSection appeal={appeal} />}
				{appeal && <AppealResultSection appeal={appeal} />}
			</ScrollView>

			{canAppeal(sanction) && (
				<View style={styles.footer}>
					<Button size="lg" onPress={() => navigateToAppealForm(sanction.id)}>
						이의 신청
					</Button>
				</View>
			)}
		</SafeAreaView>
	);
};

export default InquiryDetail;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			padding: PADDING,
			gap: Spacing.xxl,
		},
		footer: {
			paddingHorizontal: PADDING,
			paddingTop: Spacing.m,
			paddingBottom: Spacing.s,
		},
	});
