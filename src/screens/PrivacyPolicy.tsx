import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';

const PrivacyPolicy = () => {
	const styles = useThemedStyles(makeStyles);
	return (
		<View style={styles.screen}>
			<ScrollView contentContainerStyle={styles.contentContainer}>
				{/* 헤더 */}
				<Text variant="title" weight="bold" style={styles.mainTitle}>
					개인정보 처리방침
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					본 개인정보처리방침은 행정안전부 권고 『개인정보처리방침 작성
					가이드라인(2020.12)』에 따라 작성되었습니다.
				</Text>

				{/* 1. 처리 목적 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제1조 (개인정보의 처리목적)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적
					이외에서는 사용되지 않습니다.
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 서비스 회원가입 및 관리
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 소셜 로그인(본인 식별 및 부정가입 방지)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 게시글·댓글·채팅 작성자 식별
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 신고 접수 시 신고 대상 게시글·댓글·채팅 내용 확인 및 운영정책 위반 조치
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 고객 문의 응대 및 불만 처리
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 맞춤형 광고 제공
				</Text>

				{/* 2. 처리하는 개인정보 항목 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제2조 (처리하는 개인정보의 항목)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					회원가입, 로그인, 서비스 이용 과정에서 아래 개인정보를 수집합니다.
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 필수: 이메일, 소셜 ID(네이버·카카오)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 선택: 프로필 사진
				</Text>

				{/* 3. 보유 및 파기 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제3조 (개인정보의 보유 및 파기)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					1. 보유 기간: 회원 탈퇴 요청 시점부터 <Text weight="bold">60일</Text>간 보관 후
					파기합니다.{'\n'}
					2. 파기 절차: 파기 대상 선정 → 내부 방침에 따라 DB에서 완전 삭제합니다.{'\n'}
					3. 파기 방법: 전자적 파일 형태는 복원이 불가능한 방법으로 영구 삭제합니다.
				</Text>

				{/* 4. 제3자 제공 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제4조 (개인정보의 제3자 제공)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의
					경우에는 예외로 합니다.
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					• 카카오주식회사, 네이버주식회사, Apple Inc., Google LLC(소셜 로그인 제공)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 제공항목: 이메일
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 제공목적: 본인 식별 및 서비스 연동
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 보유기간: 소셜 플랫폼 정책에 따름
				</Text>

				<Text variant="body2" color="secondary" style={styles.paragraph}>
					• Google Inc.(Google AdSense)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 제공항목: 행태정보(익명화된 광고 지표)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 제공목적: 맞춤형 광고 제공 및 수익 정산
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 보유기간: Google 정책에 따름
				</Text>

				{/* 5. 처리 위탁 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제5조 (개인정보 처리 위탁)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					본 서비스는 현재 개인정보 처리 업무를 외부 업체에 위탁하지 않습니다.
				</Text>

				{/* 6. 정보주체 권리 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제6조 (정보주체의 권리·의무 및 행사방법)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					이용자는 언제든지 개인정보 열람·정정·삭제·처리정지 등을 요청할 수 있으며, 회사는
					해당 요청을 받은 즉시 필요한 절차를 진행하고, 처리 완료 후 가능한 빠른 시일 내에
					결과를 통지합니다.
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 요청방법: 앱 ‘개인정보 관리’ 또는 이메일(janechun22@gmail.com)
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 처리비용: 무료
				</Text>

				{/* 7. 책임자 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제7조 (개인정보 보호책임자)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					회사는 개인정보 처리에 관한 업무를 총괄하는 책임자를 지정하고 있습니다.
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 책임자: Jane Chun
				</Text>
				<Text variant="body2" color="secondary" style={styles.listItem}>
					• 연락처: janechun22@gmail.com
				</Text>

				{/* 8. 안전성 확보 조치 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제8조 (개인정보의 안전성 확보 조치)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					회사는 개인정보 보호법 및 관련 지침에 따라, 내부관리계획 수립·시행, 접근권한
					통제, 전송·저장 시 암호화, 정기적 보안 점검 등 합리적인 수준의
					관리적·기술적·물리적 조치를 취하고 있습니다.
				</Text>

				{/* 9. 처리방침 변경 고지 */}
				<Text variant="body1" weight="bold" style={styles.sectionTitle}>
					제9조 (개인정보 처리방침 변경 및 공지)
				</Text>
				<Text variant="body2" color="secondary" style={styles.paragraph}>
					본 방침은 법령·정책 변경 시 개정될 수 있으며, 변경된 방침은 업데이트 배포 시점에
					App Store의 업데이트 내역(릴리즈 노트)에서 확인할 수 있도록 안내합니다.
				</Text>

				<Text variant="body2" color="secondary" style={styles.footer}>
					최종 업데이트: 2025.07.02
				</Text>
			</ScrollView>
		</View>
	);
};

export default PrivacyPolicy;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		contentContainer: {
			padding: 20,
			paddingBottom: 40,
		},
		mainTitle: {
			marginBottom: 6,
		},
		footer: {
			marginTop: 20,
		},
		sectionTitle: {
			marginTop: 16,
			marginBottom: 6,
		},
		paragraph: {
			lineHeight: 22,
		},
		listItem: {
			lineHeight: 20,
			paddingLeft: 12,
			marginBottom: 4,
		},
	});
