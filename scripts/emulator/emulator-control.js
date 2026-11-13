// firebase-admin-setup.js가 Firestore·Auth 에뮬레이터 호스트를 설정한다. Storage는 여기서 맞춘다.
// getStorage()를 처음 부르기 전에 설정돼 있어야 운영 버킷이 아닌 에뮬레이터로 연결된다.
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

const { getApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

require('../../src/__tests__/firebase-utils/firebase-admin-setup');

const HUB_URL = 'http://127.0.0.1:4400';
// 트리거를 다시 켜기 전에 기다리는 시간. 마지막 쓰기의 트리거 이벤트가 켜진 뒤에 도착하지 않게 한다.
const TRIGGER_SETTLE_MS = 2000;

const projectId = () => getApp().options.projectId;

/** 앱(EXPO_PUBLIC_STORAGE_BUCKET)과 같은 이름의 에뮬레이터 버킷 */
function getEmulatorBucket() {
	const bucketName = process.env.EXPO_PUBLIC_STORAGE_BUCKET;
	if (!bucketName) {
		throw new Error('EXPO_PUBLIC_STORAGE_BUCKET이 없습니다. .env를 확인하세요.');
	}
	return getStorage().bucket(bucketName);
}

async function deleteOrThrow(url, label) {
	const response = await fetch(url, {
		method: 'DELETE',
		headers: { Authorization: 'Bearer owner' },
	});
	if (!response.ok) {
		throw new Error(`${label} 초기화 실패 (${response.status}): ${await response.text()}`);
	}
}

/** 에뮬레이터의 Auth 계정, Firestore 문서, Storage 파일을 모두 지운다. 에뮬레이터가 꺼져 있으면 예외. */
async function resetEmulator() {
	const id = projectId();
	await deleteOrThrow(
		`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${id}/databases/(default)/documents`,
		'Firestore',
	);
	await deleteOrThrow(
		`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${id}/accounts`,
		'Auth',
	);
	await getEmulatorBucket().deleteFiles({ force: true });
}

async function putHub(path) {
	try {
		const response = await fetch(`${HUB_URL}${path}`, { method: 'PUT' });
		return response.ok;
	} catch {
		return false; // Hub에 연결할 수 없음
	}
}

/**
 * Functions 백그라운드 트리거를 끈다. 시드는 commentCount·review 집계를 직접 계산해 넣으므로
 * 트리거가 돌면 값이 두 배가 된다.
 * @returns {Promise<boolean>} 껐으면 true. Functions 에뮬레이터가 없으면 false
 */
async function disableBackgroundTriggers() {
	return putHub('/functions/disableBackgroundTriggers');
}

async function enableBackgroundTriggers() {
	await new Promise((resolve) => setTimeout(resolve, TRIGGER_SETTLE_MS));
	const enabled = await putHub('/functions/enableBackgroundTriggers');
	if (!enabled) {
		console.warn('⚠️  Functions 트리거를 다시 켜지 못했습니다. 에뮬레이터를 재시작하세요.');
	}
}

module.exports = {
	getEmulatorBucket,
	resetEmulator,
	disableBackgroundTriggers,
	enableBackgroundTriggers,
};
