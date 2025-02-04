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

type UserInfo = {
	uid: string;
	displayName: string;
	photoUrl: string;
} | null;

type AuthContextType = {
	userInfo: UserInfo;
	setUserInfo: (user: UserInfo) => void;
	login: () => void;
	logout: () => void;
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
				const { uid, displayName, photoURL } = user;

				const loginUserInfo = {
					uid,
					displayName: displayName ?? '',
					photoUrl: photoURL ?? '',
				};

				setUserInfo(loginUserInfo);
				await AsyncStorage.setItem('@user', JSON.stringify(loginUserInfo));
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

			const {
				user: { uid, displayName, photoURL },
			} = result;

			const loginUserInfo = {
				uid,
				displayName: displayName ?? '',
				photoUrl: photoURL ?? '',
			};

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(loginUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(loginUserInfo));

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
		} catch (error) {
			console.log('로그아웃 실패:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ userInfo, setUserInfo, login, logout }}>
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
