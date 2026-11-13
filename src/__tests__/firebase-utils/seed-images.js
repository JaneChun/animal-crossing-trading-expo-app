const fs = require('fs');
const path = require('path');

const { getEmulatorBucket } = require('./emulator-control');

const SEED_IMAGES_DIR = path.join(__dirname, 'seed-images');
const CONTENT_TYPES = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};

// 앱(src/config/firebase.ts)과 같은 호스트를 써야 실기기에서도 이미지가 열린다
const storageHostForApp = () =>
	process.env.EXPO_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

/** seed-images/{folder}의 이미지 파일을 이름순으로 반환한다 */
function listImageFiles(folder) {
	const dir = path.join(SEED_IMAGES_DIR, folder);
	if (!fs.existsSync(dir)) return [];

	return fs
		.readdirSync(dir)
		.filter((fileName) => CONTENT_TYPES[path.extname(fileName).toLowerCase()])
		.sort()
		.map((fileName) => path.join(dir, fileName));
}

/**
 * seed-images/{folder}의 이미지를 Storage 에뮬레이터 {storagePath}/ 아래에 올리고 URL 목록을 반환한다.
 * 폴더가 비어 있으면 경고 후 빈 배열.
 */
async function uploadFolder(folder, storagePath) {
	const files = listImageFiles(folder);
	if (files.length === 0) {
		console.warn(`⚠️  seed-images/${folder}에 이미지가 없어 이미지 없이 시드합니다.`);
		return [];
	}

	const bucket = getEmulatorBucket();
	const urls = [];
	for (const filePath of files) {
		const objectPath = `${storagePath}/${path.basename(filePath)}`;
		await bucket.upload(filePath, {
			destination: objectPath,
			contentType: CONTENT_TYPES[path.extname(filePath).toLowerCase()],
		});
		// Users/, Communities/는 storage.rules에서 누구나 읽을 수 있어 토큰 없이 열린다
		urls.push(
			`http://${storageHostForApp()}/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`,
		);
	}
	return urls;
}

/** 유저 프로필·커뮤니티 이미지를 앱과 같은 경로(Users/, Communities/)에 올린다 */
async function uploadSeedImages() {
	const userPhotoUrls = await uploadFolder('users', 'Users');
	const communityImageUrls = await uploadFolder('communities', 'Communities');
	return { userPhotoUrls, communityImageUrls };
}

module.exports = { uploadSeedImages };
