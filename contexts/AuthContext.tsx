import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { auth } from '../fbase';
import {
	OAuthProvider,
	onAuthStateChanged,
	signInWithCredential,
	reauthenticateWithCredential,
	deleteUser,
} from 'firebase/auth';
import {
	// getKeyHashAndroid,
	initializeKakaoSDK,
} from '@react-native-kakao/core';
import {
	login as kakaoLogin,
	logout as kakaoLogout,
} from '@react-native-kakao/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	getUserInfoFromFirestore,
	saveUserToFirestore,
	updateDocToFirestore,
} from '@/utilities/firebaseApi';

export type UserInfo = {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
	createdAt: Date;
	lastLogin: Date;
} | null;

type AuthContextType = {
	userInfo: UserInfo;
	setUserInfo: (user: UserInfo) => void;
	login: () => void;
	logout: () => void;
	deleteAccount: (uid: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const [userInfo, setUserInfo] = useState<UserInfo>(null);

	// KakaoSDK 초기화
	useEffect(() => {
		if (process.env.EXPO_PUBLIC_KAKAO_IOS_KEY) {
			initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_IOS_KEY);
		}
	}, []);

	// Firebase Auth 상태 변화 감지
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const userInfo: UserInfo = await getUserInfoFromFirestore({
					uid: user.uid,
				});
				setUserInfo(userInfo);
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

	const login = async (): Promise<boolean> => {
		try {
			const kakaoTokenInfo = await kakaoLogin();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			const result = await signInWithCredential(auth, credential);

			const { user } = result;

			// Firestore에서 유저 정보 가져오기
			let userInfo: UserInfo = await getUserInfoFromFirestore({
				uid: user.uid,
			});

			// Firestore에 없으면 새로 저장
			if (!userInfo) {
				await saveUserToFirestore({
					uid: user.uid,
					displayName: user.displayName ?? '',
					photoURL: user.photoURL ?? '',
				});

				userInfo = await getUserInfoFromFirestore({ uid: user.uid });
			}

			// 상태 업데이트 & AsyncStorage에 저장
			setUserInfo(userInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		} catch (error) {
			console.log('로그인 실패:', error);
			setUserInfo(null);

			return false;
		}
	};

	const logout = async () => {
		try {
			await kakaoLogout(); // 카카오 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');
		} catch (e) {
			console.log('로그아웃 실패:', e);
		}
	};

	const deleteAccount = async (uid: string) => {
		const user = auth.currentUser;
		if (!user || !userInfo) return;

		try {
			// 재인증 후 탈퇴 가능
			const kakaoTokenInfo = await kakaoLogin();
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
			console.log('회원 탈퇴 성공');
		} catch (e: any) {
			if (e.code === 'auth/wrong-password') {
				console.log('❌ 잘못된 비밀번호');
			} else if (e.code === 'auth/user-mismatch') {
				console.log('❌ 인증 정보가 일치하지 않음');
			} else if (e.code === 'auth/requires-recent-login') {
				console.log('❌ 다시 로그인 후 시도해주세요.');
			} else {
				console.log('❌ 회원 탈퇴 실패:', e.message);
			}
			throw new Error(e);
		}
	};

	return (
		<AuthContext.Provider
			value={{ userInfo, setUserInfo, login, logout, deleteAccount }}
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
