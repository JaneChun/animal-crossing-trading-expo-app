import { useAuthStore } from './store';

export { useAuthInitializer } from './initializer';
export { useAuthStore } from './store';
export { LoginResult } from './types';

// 커스텀 훅들
export const useUserInfo = () => useAuthStore((state) => state.userInfo);
export const useIsAuthLoading = () => useAuthStore((state) => state.isAuthLoading);
