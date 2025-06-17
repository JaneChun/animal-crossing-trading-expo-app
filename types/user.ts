export interface PublicUserInfo {
	uid: string;
	displayName: string;
	islandName: string;
	photoURL: string;
	pushToken?: string;
	review: {
		total: number;
		positive: number;
		negative: number;
	};
	badgeGranted: boolean;
}

export interface UserInfo extends PublicUserInfo {
	oauthType: OauthType;
	createdAt: Date;
	lastLogin: Date;
}

export type OauthType = 'kakao' | 'naver';
