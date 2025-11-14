const { auth, db } = require('./firebase-admin-setup');

async function deleteDocumentById(collectionName, id) {
	try {
		await db.collection(collectionName).doc(id).delete();
		console.log(`Firestore ${collectionName} 컬렉션: id=${id} 문서 삭제 완료`);
		return true;
	} catch (error) {
		console.error(`Firestore ${collectionName} 컬렉션: id=${id} 문서 삭제 실패:`, error.message);
		throw error;
	}
}

async function deleteDocumentsByField(collectionName, fieldName, fieldValue) {
	try {
		const snapshot = await db.collection(collectionName).where(fieldName, '==', fieldValue).get();

		if (snapshot.empty) {
			return 0;
		}

		const batch = db.batch();
		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref);
		});

		await batch.commit();
		console.log(`Firestore ${collectionName} 컬렉션: ${fieldName}=${fieldValue} 문서 삭제 완료`);
		return snapshot.size;
	} catch (error) {
		console.error(
			`Firestore ${collectionName} 컬렉션: ${fieldName}=${fieldValue} 문서 삭제 실패:`,
			error.message,
		);
		throw error;
	}
}

async function deleteCollection(collectionName) {
	try {
		const snapshot = db.collection(collectionName);

		if (snapshot.empty) {
			return 0;
		}

		let deletedCount = 0;
		const batch = db.batch();

		for (const doc of snapshot.docs) {
			batch.delete(doc.ref);
			deletedCount++;
		}

		await batch.commit();
		return deletedCount;
	} catch (error) {
		console.error(`${collectionName} 컬렉션 삭제 실패:`, error.message);
		throw error;
	}
}

async function deleteSubcollection(documentRef, subcollectionName) {
	try {
		const subcollectionRef = documentRef.collection(subcollectionName);
		const snapshot = await subcollectionRef.get();

		if (snapshot.empty) {
			return 0;
		}

		let deletedCount = 0;
		const batch = db.batch();

		for (const doc of snapshot.docs) {
			// 대댓글 (Replies) 서브컬렉션 삭제
			if (subcollectionName === 'Comments') {
				const repliesCount = await deleteSubcollection(doc.ref, 'Replies');
				deletedCount += repliesCount;
			}

			batch.delete(doc.ref);
			deletedCount++;
		}

		await batch.commit();
		return deletedCount;
	} catch (error) {
		console.error(`${subcollectionName} 서브컬렉션 삭제 실패:`, error.message);
		throw error;
	}
}

/**
 * 전체 테스트 데이터 정리 (Users, DeleteUsers, Auth)
 * @param {string} displayName - 정리할 유저의 displayName
 * @param {string} uid - 정리할 유저의 UID
 * @returns {Promise<Object>} 정리 결과
 */
async function cleanupTestUser(uid) {
	try {
		// Firestore Users 컬렉션에서 삭제
		await deleteDocumentById('Users', uid);

		// Firestore DeleteUsers 컬렉션에서 삭제
		await deleteDocumentById('DeletedUsers', uid);

		// Firebase Auth에서 삭제
		await deleteAuthUser(uid);

		console.log(`테스트 유저 Auth, Firestore 정리 완료: ${uid}`);
		return true;
	} catch (error) {
		console.error(`테스트 유저 Auth, Firestore 정리 실패: ${uid}`, error.message);
		throw error;
	}
}

/**
 * Firebase Auth 유저 삭제
 * @param {string} uid - 삭제할 유저 UID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteAuthUser(uid) {
	try {
		await auth.deleteUser(uid);
		console.log(`Auth 유저 삭제 완료: ${uid}`);
		return true;
	} catch (error) {
		if (error.code === 'auth/user-not-found') {
			console.log(`ℹ️  Auth 유저 없음 (이미 삭제됨): ${uid}`);
			return true; // 없는 것도 성공으로 간주
		}
		console.error(`Auth 유저 ${uid} 삭제 실패:`, error.message);
		throw error;
	}
}

module.exports = {
	deleteDocumentsByField,
	deleteCollection,
	deleteSubcollection,
	cleanupTestUser,
};
