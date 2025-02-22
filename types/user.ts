export interface PublicUserInfo {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
}

export interface UserInfo extends PublicUserInfo {
	createdAt: Date;
	lastLogin: Date;
}
