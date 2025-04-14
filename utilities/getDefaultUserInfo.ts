import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
} from '@/constants/defaultUserInfo';
import { PublicUserInfo } from '@/types/user';

export const getDefaultUserInfo = (uid: string = ''): PublicUserInfo => ({
	uid,
	displayName: DEFAULT_USER_DISPLAY_NAME,
	islandName: DEFAULT_USER_ISLAND_NAME,
	photoURL: DEFAULT_USER_PHOTO_URL,
});
