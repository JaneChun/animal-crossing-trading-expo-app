const { auth, db } = require('./firebase-admin-setup');
const { Timestamp } = require('firebase/firestore');

const TEST_USER_A = {
	uid: 'Zrc3ke0dYXcskivyQIba4ZJKpEJp5VbQ7Ms-snLbkhM',
	displayName: '네이버유저',
	islandName: '네이버섬',
	email: 'wlehf97@naver.com',
	photoURL: '',
	oauthType: 'naver',
	createdAt: Timestamp.now(),
	lastLogin: Timestamp.now(),
};

const TEST_USER_B = {
	uid: 'test-user-' + Date.now(),
	displayName: '테스트유저',
	islandName: '테스트섬',
	email: 'test@example.com',
	photoURL: '',
	oauthType: 'naver',
	createdAt: Timestamp.now(),
	lastLogin: Timestamp.now(),
};
