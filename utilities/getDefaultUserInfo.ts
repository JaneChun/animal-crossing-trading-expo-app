import {
	DEFAULT_USER_DISPLAY_NAME,
	DEFAULT_USER_ISLAND_NAME,
	DEFAULT_USER_PHOTO_URL,
	DEFAULT_USER_REPORT,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { PublicUserInfo } from '@/types/user';

export const getDefaultUserInfo = (uid: string = ''): PublicUserInfo => ({
	uid,
	displayName: DEFAULT_USER_DISPLAY_NAME,
	islandName: DEFAULT_USER_ISLAND_NAME,
	photoURL: DEFAULT_USER_PHOTO_URL,
	review: DEFAULT_USER_REVIEW,
	report: DEFAULT_USER_REPORT,
});
