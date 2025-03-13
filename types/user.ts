export interface PublicUserInfo {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
}

export interface UserInfo extends PublicUserInfo {
	oauthType: OauthType;
	createdAt: Date;
	lastLogin: Date;
}

export type OauthType = 'kakao' | 'naver';
