import axios from 'axios';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

export const getFirebaseToken = functions.https.onRequest(
	async (req: any, res: any) => {
		try {
			// 요청에서 accessToken 가져오기
			const { accessToken } = req.body;

			if (!accessToken) {
				return res.status(400).json({ error: 'Access token이 필요합니다.' });
			}

			// 네이버 사용자 정보 요청
			const { data } = await axios.get('https://openapi.naver.com/v1/nid/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (data.resultcode !== '00') {
				throw new Error('네이버 사용자 정보 조회 실패');
			}

			const { id, email, nickname } = data.response;

			// Firebase에서 사용자 ID로 커스텀 토큰 생성
			const customToken = await admin.auth().createCustomToken(id, {
				email,
				displayName: nickname,
			});

			return res.json({ firebaseToken: customToken });
		} catch (error) {
			console.error('Firebase 토큰 생성 실패:', error);
			return res.status(500).json({ error: 'Firebase Custom Token 생성 실패' });
		}
	},
);
