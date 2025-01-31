import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { auth } from '../fbase';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
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

	useEffect(() => {
		if (process.env.EXPO_PUBLIC_KAKAO_IOS_KEY) {
			initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_IOS_KEY);
		}
	}, []);

	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await AsyncStorage.getItem('@user');
			if (storedUser) {
				setUserInfo(JSON.parse(storedUser));
			}
		};

		loadUser();
	}, []);

	const login = async () => {
		try {
			const kakaoTokenInfo = await kakaoLogin();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			const result = await signInWithCredential(auth, credential);

			const {
				user: { displayName, photoURL },
			} = result;

			const loginUserInfo = {
				displayName: displayName ?? '',
				photoUrl: photoURL ?? '',
			};

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(loginUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(loginUserInfo));
		} catch (error) {
			console.log('Login failed:', error);
			setUserInfo(null);
		}
	};

	const logout = async () => {
		try {
			await kakaoLogout();

			// 상태 업데이트 & AsyncStorage에서 삭제
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');
		} catch (error) {
			console.log('Logout failed:', error);
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
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
