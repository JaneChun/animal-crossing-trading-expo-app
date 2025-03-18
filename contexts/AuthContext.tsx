import { updateDocToFirestore } from '@/firebase/core/firestoreService';
import { getUserInfo, saveUserInfo } from '@/firebase/services/userService';
import { UserInfo } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	// getKeyHashAndroid,
	initializeKakaoSDK,
} from '@react-native-kakao/core';
import { login, logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import axios from 'axios';
import {
	deleteUser,
	OAuthProvider,
	onAuthStateChanged,
	reauthenticateWithCredential,
	signInWithCredential,
	signInWithCustomToken,
} from 'firebase/auth';
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { Alert } from 'react-native';
import { auth } from '../fbase';
import firebaseRequest from '../firebase/core/firebaseInterceptor';

type AuthContextType = {
	userInfo: UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	kakaoLogin: () => void;
	kakaoLogout: () => void;
	kakaoDeleteAccount: (uid: string) => void;
	naverLogin: () => void;
	naverLogout: () => void;
	naverDeleteAccount: (uid: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

	// KakaoSDK 초기화
	useEffect(() => {
		if (process.env.EXPO_PUBLIC_KAKAO_IOS_KEY) {
			initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_IOS_KEY);
		}
	}, []);

	// NaverSDK 초기화
	useEffect(() => {
		NaverLogin.initialize({
			appName: '모동숲 마켓',
			consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '',
			consumerSecret: process.env.EXPO_PUBLIC_NAVER_SECRET || '',
			serviceUrlSchemeIOS: process.env.EXPO_PUBLIC_NAVER_SERVICE_URL_SCHEME,
			disableNaverAppAuthIOS: true,
		});
	}, []);

	// Firebase Auth 상태 변화 감지
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const fetchedUserInfo = await getUserInfo(user.uid);

				if (!fetchedUserInfo) {
					Alert.alert(
						'계정 정보 없음',
						'유저 정보를 불러올 수 없습니다. 다시 로그인해 주세요.',
						[{ text: '확인', onPress: () => auth.signOut() }],
					);

					setUserInfo(null);
					await AsyncStorage.removeItem('@user');
					return;
				}

				setUserInfo(fetchedUserInfo);
				await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
			} else {
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
			}
		});
		return () => unsubscribe(); // 언마운트 시 구독 해제
	}, []);

	// 앱 시작 시 AsyncStorage에서 유저 정보 로드
	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await AsyncStorage.getItem('@user');
			if (storedUser) {
				setUserInfo(JSON.parse(storedUser));
			}
		};

		loadUser();
	}, []);

	const kakaoLogin = async (): Promise<boolean> => {
		return firebaseRequest('로그인', async () => {
			const kakaoTokenInfo = await login();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			const result = await signInWithCredential(auth, credential);
			const { user } = result;

			// Firestore에서 유저 정보 가져오기
			let fetchedUserInfo = await getUserInfo(user.uid);

			// Firestore에 없으면 새로 저장
			if (!fetchedUserInfo) {
				await saveUserInfo({
					uid: user.uid,
					displayName: user.displayName ?? '',
					photoURL: user.photoURL ?? '',
					oauthType: 'kakao',
				});

				fetchedUserInfo = await getUserInfo(user.uid);
			}

			// 상태 업데이트 & AsyncStorage에 저장
			setUserInfo(fetchedUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		});
	};

	const kakaoLogout = async (): Promise<boolean> => {
		return firebaseRequest('로그아웃', async () => {
			await logout(); // 카카오 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		});
	};

	const kakaoDeleteAccount = async (uid: string) => {
		return firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !userInfo) return false;

			// 재인증 후 탈퇴 가능
			const kakaoTokenInfo = await login();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			await reauthenticateWithCredential(user, credential);

			// Firebase auth에서 유저 삭제
			await deleteUser(user);

			// Firestore의 Users 컬렉션 업데이트
			await updateDocToFirestore({
				id: userInfo?.uid,
				collection: 'Users',
				requestData: {
					displayName: '탈퇴한 사용자',
					islandName: '무인도',
					photoURL: '',
					isDeletedAccount: true, // 탈퇴 여부 표시
					oldData: {
						...userInfo,
					},
				},
			});

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		});
	};

	const naverLogin = async (): Promise<void> => {
		return firebaseRequest('로그인', async () => {
			const { failureResponse, successResponse } = await NaverLogin.login();

			if (failureResponse) return false;

			const firebaseCustomToken = await getFirebaseCustomToken(
				successResponse!.accessToken,
			);

			const result = await signInWithCustomToken(auth, firebaseCustomToken);
			const { user } = result;

			// Firestore에서 유저 정보 가져오기
			let fetchedUserInfo = await getUserInfo(user.uid);

			// Firestore에 없으면 새로 저장
			if (!fetchedUserInfo) {
				const profileResult = await NaverLogin.getProfile(
					successResponse!.accessToken,
				);

				await saveUserInfo({
					uid: user.uid,
					displayName: profileResult.response.nickname ?? '',
					photoURL: profileResult.response.profile_image ?? '',
					oauthType: 'naver',
				});

				fetchedUserInfo = await getUserInfo(user.uid);
			}

			// 상태 업데이트 & AsyncStorage에 저장
			setUserInfo(fetchedUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		});
	};

	const naverLogout = () => {
		return firebaseRequest('로그아웃', async () => {
			await NaverLogin.logout(); // 네이버 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		});
	};

	const naverDeleteAccount = async (uid: string) => {
		return firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !userInfo) return false;

			// 재인증 후 탈퇴 가능
			const { failureResponse, successResponse } = await NaverLogin.login();

			if (failureResponse) return false;

			const firebaseCustomToken = await getFirebaseCustomToken(
				successResponse!.accessToken,
			);

			await signInWithCustomToken(auth, firebaseCustomToken);

			// Firebase auth에서 유저 삭제
			await deleteUser(user);

			// 네이버로그인 토큰 삭제
			await NaverLogin.deleteToken();

			// Firestore의 Users 컬렉션 업데이트
			await updateDocToFirestore({
				id: userInfo?.uid,
				collection: 'Users',
				requestData: {
					displayName: '탈퇴한 사용자',
					islandName: '무인도',
					photoURL: '',
					isDeletedAccount: true, // 탈퇴 여부 표시
					oldData: {
						...userInfo,
					},
				},
			});

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		});
	};

	const getFirebaseCustomToken = async (accessToken: string) => {
		try {
			const response = await axios.post(
				process.env.EXPO_PUBLIC_GET_CUSTOM_TOKEN_URL || '',
				{ accessToken },
				{ headers: { 'Content-Type': 'application/json' } },
			);

			return response.data.firebaseToken;
		} catch (error) {
			console.error('Error getting Firebase custom token:', error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				userInfo,
				setUserInfo,
				kakaoLogin,
				kakaoLogout,
				kakaoDeleteAccount,
				naverLogin,
				naverLogout,
				naverDeleteAccount,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth는 AuthProvider 안에서 사용되어야 합니다.');
	}
	return context;
};
