const fs = require('fs');
const path = require('path');

const { db } = require('../../src/__tests__/firebase-utils/firebase-admin-setup');

// functions/scripts/parse-catalog.ts가 만드는 원본. gitignore 대상이라 새 환경에는 없을 수 있다.
const CATALOG_JSON_PATH = path.join(__dirname, '../../functions/scripts/output/catalog.json');
const MAX_BATCH = 500;

/**
 * catalog.json을 에뮬레이터 CatalogItems(+ variants 서브컬렉션)에 저장한다.
 * 문서 구조는 운영 import(functions/scripts/import-catalog.ts)와 같다.
 * @returns {Promise<{ itemCount: number, variantCount: number } | null>} 원본이 없어 건너뛰면 null
 */
async function seedCatalog() {
	if (!fs.existsSync(CATALOG_JSON_PATH)) {
		console.warn(`⚠️  카탈로그 원본이 없어 건너뜁니다: ${CATALOG_JSON_PATH}`);
		return null;
	}

	const catalogItems = JSON.parse(fs.readFileSync(CATALOG_JSON_PATH, 'utf-8'));

	let batch = db.batch();
	let pendingWrites = 0;
	let itemCount = 0;
	let variantCount = 0;

	const queueWrite = async (ref, data) => {
		batch.set(ref, data);
		pendingWrites++;
		if (pendingWrites >= MAX_BATCH) {
			await batch.commit();
			batch = db.batch();
			pendingWrites = 0;
		}
	};

	for (const item of catalogItems) {
		if (!item.id) continue;

		const itemRef = db.collection('CatalogItems').doc(String(item.id));
		await queueWrite(itemRef, {
			name: item.name,
			imageUrl: item.imageUrl,
			bodyTitle: item.bodyTitle,
			patternTitle: item.patternTitle,
			category: item.category,
			attributes: item.attributes,
		});
		itemCount++;

		for (const variant of item.variants ?? []) {
			if (!variant.variantId) continue;

			await queueWrite(itemRef.collection('variants').doc(variant.variantId), {
				id: variant.id, // Unique Entry ID (CartItem 변환용)
				variantId: variant.variantId, // "X_Y"
				body: variant.body,
				pattern: variant.pattern,
				imageUrl: variant.imageUrl,
			});
			variantCount++;
		}
	}

	if (pendingWrites > 0) {
		await batch.commit();
	}

	return { itemCount, variantCount };
}

module.exports = { seedCatalog };
