const { liteClient } = require('algoliasearch/lite');

const { db } = require('../../src/__tests__/firebase-utils/firebase-admin-setup');

const MAX_BATCH = 500;

/**
 * 운영 Algolia Villagers 인덱스의 주민을 에뮬레이터 Villagers 컬렉션에 저장한다.
 * 앱은 주민 검색을 Algolia로, 표시를 Firestore Villagers 문서로 하므로 문서 ID를 objectID와 맞춘다.
 * @returns {Promise<number | null>} 저장한 주민 수. Algolia에서 가져오지 못해 건너뛰면 null
 */
async function seedVillagers() {
	const appId = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
	const searchKey = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;

	let hits;
	try {
		if (!appId || !searchKey) {
			throw new Error('EXPO_PUBLIC_ALGOLIA_APP_ID 또는 EXPO_PUBLIC_ALGOLIA_SEARCH_KEY가 없습니다');
		}
		const searchClient = liteClient(appId, searchKey);
		// 주민은 400여 명이라 빈 검색어 한 번으로 전부 받는다
		const { results } = await searchClient.searchForHits({
			requests: [{ indexName: 'Villagers', query: '', hitsPerPage: 1000 }],
		});
		hits = results[0].hits;
	} catch (error) {
		console.warn(`⚠️  주민 데이터를 가져오지 못해 건너뜁니다: ${error.message}`);
		return null;
	}

	for (let start = 0; start < hits.length; start += MAX_BATCH) {
		const batch = db.batch();
		for (const hit of hits.slice(start, start + MAX_BATCH)) {
			// Villager 타입(src/types/villager.ts) 필드만 저장한다
			batch.set(db.collection('Villagers').doc(hit.objectID), {
				name: hit.name,
				imageUrl: hit.imageUrl,
				species: hit.species,
				personality: hit.personality,
			});
		}
		await batch.commit();
	}

	return hits.length;
}

module.exports = { seedVillagers };
