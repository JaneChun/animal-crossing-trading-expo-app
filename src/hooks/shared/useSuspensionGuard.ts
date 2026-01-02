import { useAuthStore, useUserInfo } from '@/stores/auth';
import { Timestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export const useSuspensionGuard = () => {
	const userInfo = useUserInfo();
	const kakaoLogout = useAuthStore((state) => state.kakaoLogout);
	const naverLogout = useAuthStore((state) => state.naverLogout);
	const appleLogout = useAuthStore((state) => state.appleLogout);

	useEffect(() => {
		const suspendUntil = userInfo?.report?.suspendUntil;

		if (suspendUntil && Timestamp.now() < suspendUntil) {
			const formattedDate = suspendUntil
				.toDate()
				.toLocaleDateString('ko-KR')
				.slice(0, -1);

			Alert.alert(
				'계정 일시 정지',
				`회원님의 계정은 최근 누적된 신고로 인해 커뮤니티 운영 정책에 따라 일정 기간 동안 활동이 제한되었습니다.\n정지 해제일: ${formattedDate}`,

				[
					{
						text: '로그아웃',
						onPress: async () => {
							if (!userInfo) return;

							if (userInfo.oauthType === 'kakao') await kakaoLogout();
							else if (userInfo.oauthType === 'naver') await naverLogout();
							else if (userInfo.oauthType === 'apple') await appleLogout();
						},
					},
				],
			);
		}
	}, [userInfo]);
};
