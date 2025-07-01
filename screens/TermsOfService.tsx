import { Colors } from '@/constants/Color';
import React from 'react';
import {
	Linking,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
} from 'react-native';

const TermsOfService = () => (
	<SafeAreaView style={styles.container}>
		<ScrollView contentContainerStyle={styles.contentContainer}>
			{/* Header */}
			<Text style={styles.mainTitle}>이용약관</Text>

			{/* 제1조 목적 */}
			<Text style={styles.sectionTitle}>제1조 (목적)</Text>
			<Text style={styles.paragraph}>
				본 약관은 개발자 Jane Chun(이하 ‘회사’)이 제공하는 ‘모동숲 마켓’(이하
				‘서비스’)의 이용 조건과 절차, 회사와 이용자의 권리·의무·책임 사항을
				규정함을 목적으로 합니다.
			</Text>

			{/* 제2조 정의 */}
			<Text style={styles.sectionTitle}>제2조 (정의)</Text>
			<Text style={styles.listItem}>
				• ‘이용자’란 본 약관에 동의하고 서비스에 접속하여 이용하는 자를
				말합니다.
			</Text>
			<Text style={styles.listItem}>
				• ‘계정’이란 이용자가 서비스 이용을 위해 제공받은 식별 정보를 말합니다.
			</Text>

			{/* 제3조 회원가입 및 소셜 로그인 */}
			<Text style={styles.sectionTitle}>제3조 (회원가입 및 소셜 로그인)</Text>
			<Text style={styles.listItem}>
				• 이용자는 네이버/카카오/Apple 소셜 로그인을 통해 회원가입할 수
				있습니다.
			</Text>
			<Text style={styles.listItem}>
				• 소셜 로그인 시 수집되는 정보(이메일)는 본인 식별 및 서비스 제공
				목적으로만 사용됩니다.
			</Text>
			<Text style={styles.listItem}>
				• 회원가입 직후 닉네임 입력 페이지를 거쳐 커뮤니티 활동용 닉네임을
				설정합니다.
			</Text>

			{/* 제4조 회원 탈퇴 */}
			<Text style={styles.sectionTitle}>제4조 (회원 탈퇴)</Text>
			<Text style={styles.listItem}>
				• 이용자는 언제든 앱 내 ‘회원 탈퇴’ 기능을 통해 탈퇴를 요청할 수
				있습니다.
			</Text>
			<Text style={styles.listItem}>
				• 탈퇴 후 30일간 동일 소셜 계정으로 재가입이 제한됩니다.
			</Text>
			<Text style={styles.listItem}>
				• 탈퇴 후 30일 경과 시 재가입이 가능하며, 재가입 시 기존 작성한
				게시글·댓글·채팅에 대한 편집·삭제 권한이 자동으로 재부여됩니다.
			</Text>
			<Text style={styles.listItem}>
				• 탈퇴 후 60일이 경과하면 개인정보가 영구 삭제되며, 작성한
				게시글·댓글·채팅 데이터는 계속 보존되어 ‘탈퇴한 사용자’로 표시됩니다.
			</Text>

			{/* 제5조 서비스 이용 제한 */}
			<Text style={styles.sectionTitle}>제5조 (서비스 이용 제한 및 제재)</Text>
			<Text style={styles.listItem}>
				• 회사는 이용자가 본 약관 또는 관계법령을 위반하거나, 다음 각 호의
				행위를 한 경우 사전 통보 없이 게시물 삭제, 이용 제한(일시정지·영구정지)
				등의 제재를 할 수 있습니다.
			</Text>
			<Text style={styles.nestedListItem}>
				- 타인에 대한 비방·명예훼손·혐오 발언 등 불쾌한 콘텐츠 게시
			</Text>
			<Text style={styles.nestedListItem}>
				- 음란물·폭력·차별·불법 행위를 조장하는 게시물
			</Text>
			<Text style={styles.nestedListItem}>- 허위·과장 광고, 스팸성 게시물</Text>
			<Text style={styles.listItem}>
				• 이용자 신고가 3회 이상 누적된 경우, 해당 이용자는 7일간 서비스 이용이
				일시정지 되며, 신고가 7회 이상 누적될 경우 30일간 서비스 이용이
				일시정지된 후 관리자 검토를 거쳐 영구정지 처분이 이루어질 수 있습니다.
			</Text>
			<Text style={styles.listItem}>
				• 제재에 이의가 있는 이용자는 고객센터(janechun22@gmail.com)로 문의할 수
				있습니다.
			</Text>

			{/* 제6조 지적재산권 및 라이선스 */}
			<Text style={styles.sectionTitle}>제6조 (지적재산권 및 라이선스)</Text>
			<Text style={styles.listItem}>
				• 본 서비스의 모든 UI·코드·문구 등은 회사의 지적재산입니다.
			</Text>
			<Text style={styles.listItem}>
				• ‘모여봐요 동물의 숲’ 아이템 명칭·이미지는 Nintendo의 자산이며, 무료 팬
				메이드 앱으로 제공됩니다.
			</Text>
			<Text style={styles.listItem}>
				• 광고 수익 모델(Google AdSense)으로 발생하는 수익은 개발자에게
				귀속됩니다.
			</Text>
			<Text style={styles.listItem}>
				• 본 서비스는 Nintendo와 공식 제휴 관계가 없으며, 허가를 받지
				않았습니다.
			</Text>
			<Text style={styles.listItem}>• © Nintendo. All Rights Reserved.</Text>
			<Text style={styles.listItem}>
				• 아이템 데이터 출처:{' '}
				<Text
					style={styles.link}
					onPress={() =>
						Linking.openURL(
							'https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4',
						)
					}
				>
					Data Spreadsheet for Animal Crossing New Horizons
				</Text>
			</Text>

			{/* 제7조 면책조항 */}
			<Text style={styles.sectionTitle}>제7조 (면책조항)</Text>
			<Text style={styles.paragraph}>
				이용자 간 거래 및 서비스 이용 과정에서 발생한 사기·분쟁에 대해 회사는
				중개 플랫폼 역할만 수행하며, 책임을 지지 않습니다. 서비스 오류·접속 지연
				등으로 인한 손해에 대해서도 고의·중대한 과실이 없는 한 면책됩니다.
			</Text>

			{/* 제8조 분쟁해결 */}
			<Text style={styles.sectionTitle}>제8조 (분쟁해결)</Text>
			<Text style={styles.paragraph}>
				본 약관 및 서비스 이용과 관련하여 분쟁이 발생할 경우 당사자 간 협의를
				우선하며, 협의가 이루어지지 않을 경우 대한민국 서울중앙지방법원을 제1심
				관할 법원으로 합니다.
			</Text>

			<Text style={styles.footer}>최종 업데이트: 2025.07.02</Text>
		</ScrollView>
	</SafeAreaView>
);

export default TermsOfService;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	contentContainer: {
		padding: 20,
		paddingBottom: 40,
	},
	mainTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 6,
	},
	footer: {
		fontSize: 14,
		marginTop: 20,
		color: '#333',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 6,
	},
	paragraph: {
		fontSize: 14,
		lineHeight: 22,
		color: '#333',
	},
	listItem: {
		fontSize: 14,
		lineHeight: 20,
		color: '#333',
		paddingLeft: 12,
		marginBottom: 4,
	},
	nestedListItem: {
		fontSize: 14,
		lineHeight: 20,
		color: '#333',
		paddingLeft: 24,
		marginBottom: 4,
	},
	link: {
		color: Colors.primary,
		textDecorationLine: 'underline',
	},
});
