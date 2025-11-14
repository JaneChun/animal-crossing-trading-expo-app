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

/**
 * Firebase Auth에 테스트 사용자 생성
 * @param {Object} userData - 사용자 정보
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
async function createTestAuthUser(userData = TEST_USER_A) {
	try {
		// 이미 존재하는지 확인
		try {
			const existingUser = await auth.getUser(userData.uid);
			console.log(`ℹ️  Auth 유저 이미 존재: ${userData.displayName} (${userData.uid})`);
			return existingUser;
		} catch (error) {
			if (error.code !== 'auth/user-not-found') {
				throw error;
			}
		}

		// 사용자 생성
		const userRecord = await auth.createUser({
			uid: userData.uid,
			email: userData.email,
			displayName: userData.displayName,
			photoURL: userData.photoURL,
		});

		console.log(`✅ Auth 유저 생성 완료: ${userData.displayName} (${userData.uid})`);
		return userRecord;
	} catch (error) {
		console.error('❌ Auth 유저 생성 실패:', error.message);
		throw error;
	}
}

/**
 * Firestore Users 컬렉션에 사용자 문서 생성
 * @param {Object} userData - 사용자 정보
 * @returns {Promise<string>} 생성된 문서 ID
 */
async function createTestFirestoreUser(userData = TEST_USER_A) {
	try {
		const userDoc = {
			uid: userData.uid,
			displayName: userData.displayName,
			islandName: userData.islandName,
			email: userData.email,
			photoURL: userData.photoURL,
			oauthType: userData.oauthType,
			createdAt: userData.createdAt,
			lastLogin: userData.lastLogin,
		};

		await db.collection('Users').doc(userData.uid).set(userDoc);
		console.log(`✅ Firestore 유저 생성 완료: ${userData.displayName}`);
		return userData.uid;
	} catch (error) {
		console.error('❌ Firestore 유저 생성 실패:', error.message);
		throw error;
	}
}

/**
 * 테스트 사용자 전체 설정 (Auth + Firestore)
 * @param {Object} userData - 사용자 정보
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
async function setupTestUser(userData = TEST_USER_A) {
	try {
		await createTestAuthUser(userData);
		await createTestFirestoreUser(userData);
		console.log(`🎉 테스트 유저 설정 완료: ${userData.displayName}`);
		return userData;
	} catch (error) {
		console.error('❌ 테스트 유저 설정 실패:', error.message);
		throw error;
	}
}

/**
 * 테스트 게시글 생성
 * @param {Object} postData - 게시글 정보
 * @returns {Promise<string>} 생성된 게시글 ID
 */
async function createTestPost(postData = {}) {
	try {
		const defaultPost = {
			type: 'buy',
			title: '테스트 게시글',
			body: '테스트 내용입니다.',
			creatorId: TEST_USER_A.uid,
			cart: [],
			chatRoomIds: [],
			commentCount: 0,
			createdAt: Timestamp.now(),
			reviewPromptSent: false,
			status: 'active',
		};

		const docRef = await db.collection('Boards').add(defaultPost);
		console.log(`✅ 테스트 게시글 생성 완료: ${docRef.id}`);
		return docRef.id;
	} catch (error) {
		console.error('❌ 테스트 게시글 생성 실패:', error.message);
		throw error;
	}
}

/**
 * 테스트 댓글 생성
 * @param {string} postId - 게시글 ID
 * @param {Object} commentData - 댓글 정보
 * @returns {Promise<string>} 생성된 댓글 ID
 */
async function createTestComment(postId, commentData = {}) {
	try {
		const defaultComment = {
			body: '관심있어요!',
			creatorId: TEST_USER_B.uid,
			createdAt: Timestamp.now(),
		};

		const docRef = await db
			.collection('Boards')
			.doc(postId)
			.collection('Comments')
			.add(defaultComment);

		console.log(`✅ 테스트 댓글 생성 완료: ${docRef.id}`);
		return docRef.id;
	} catch (error) {
		console.error('❌ 테스트 댓글 생성 실패:', error.message);
		throw error;
	}
}

/**
 * 게시글 존재 여부 확인
 * @param {string} title - 게시글 제목
 * @returns {Promise<boolean>}
 */
async function checkPostExists(title) {
	try {
		const snapshot = await db.collection('Boards').where('title', '==', title).limit(1).get();

		return !snapshot.empty;
	} catch (error) {
		console.error('❌ 게시글 확인 실패:', error.message);
		return false;
	}
}

/**
 * 리뷰 존재 여부 확인
 * @param {string} reviewerId - 리뷰 작성자 ID
 * @returns {Promise<Object|null>} 리뷰 데이터 또는 null
 */
async function checkReviewExists(reviewerId) {
	try {
		const snapshot = await db
			.collection('Reviews')
			.where('reviewerId', '==', reviewerId)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}

		return snapshot.docs[0].data();
	} catch (error) {
		console.error('❌ 리뷰 확인 실패:', error.message);
		return null;
	}
}

module.exports = {
	TEST_USER_A,
	TEST_USER_B,
	setupTestUser,
	createTestPost,
	createTestComment,
	checkPostExists,
	checkReviewExists,
};
