// ═══════════════════════════════════════════════════════════
//  Building Blocks (내부 재사용, export 안 함)
// ═══════════════════════════════════════════════════════════

// 구매/판매 공통 (buy 필수)
interface _WithBuySell {
	buy: number | 'NFS';
	sell: number;
	catalog: string;
	source: string;
	sourceNotes: string | null;
	seasonEvent: string | null;
	seasonEventExclusive: 'Yes' | 'No' | null;
}

// 구매/판매 공통 (buy 선택 — Other / Recipes 용)
interface _WithNullableBuySell {
	buy: number | 'NFS' | null;
	sell: number;
	source: string;
	sourceNotes: string | null;
	seasonEvent: string | null;
	seasonEventExclusive: 'Yes' | 'No' | null;
}

interface _WithColors {
	color1: string | null;
	color2: string | null;
}

interface _WithDIY {
	diy: 'Yes' | 'No';
}

interface _WithHHABase {
	hhaBasePoints: number | null;
}

// HHA 테마·시리즈만 (hhaSet/hhaCategory 없이도 재사용 가능하도록 분리)
interface _WithHHAConcepts {
	hhaConcept1: string | null;
	hhaConcept2: string | null;
	hhaSeries: string | null;
}

// 풀 HHA (가구/소품 등)
interface _WithHHAFull extends _WithHHABase, _WithHHAConcepts {
	hhaSet: string | null;
	hhaCategory: string | null;
}

interface _WithExchange {
	exchangePrice: number | null;
	exchangeCurrency: string | null;
}

interface _WithCustomize {
	bodyCustomize: 'Yes' | 'No' | null;
	patternCustomize: 'Yes' | 'No' | null;
	patternCustomizeOptions: number | null;
	kitCost: number | null;
	kitType: string | null;
	cyrusCustomizePrice: number | null;
}

// 가구류 공통 베이스
interface _WithFurnitureBase
	extends _WithBuySell, _WithColors, _WithDIY, _WithHHAFull, _WithExchange, _WithCustomize {
	size: string | null;
	tag: string | null;
	interact: string | null;
	outdoor: 'Yes' | 'No' | null;
	lightingType: string | null;
}

// 의류 공통 베이스
interface _WithClothingBase
	extends _WithBuySell, _WithColors, _WithDIY, _WithHHABase, _WithExchange {
	closetImageUrl: string | null;
	storageImageUrl: string | null;
	size: string | null;
	style1: string | null;
	style2: string | null;
	gender: string | null;
	villagerGender: string | null;
	seasonalAvailability: string | null;
	seasonality: string | null;
	mannequinSeason: string | null;
	labelThemes: string | null;
	sortOrder: number | null;
	villagerEquippable: 'Yes' | 'No' | null;
}

// 인테리어 공통 베이스 (_WithHHAConcepts 재사용 — hhaSet/hhaCategory 없음)
interface _WithInteriorBase
	extends _WithBuySell, _WithColors, _WithDIY, _WithHHABase, _WithHHAConcepts, _WithExchange {
	tag: string | null;
}

// 크리처 공통 베이스 (buy/catalog 없음, hhaCategory만 있고 series/set/concept 없음)
interface _WithCreatureBase extends _WithColors, _WithHHABase {
	iconImageUrl: string | null;
	critterpediaImageUrl: string | null;
	furnitureImageUrl: string | null;
	sell: number;
	whereHow: string | null;
	size: string | null;
	surface: string | null;
	hhaCategory: string | null;
	totalCatchesToUnlock: number | null;
	spawnRates: string | null;
	// NH/SH 월별 출현 데이터 — 배열 인덱스 0=Jan ... 11=Dec, 미출현이면 빈 문자열
	nhAvailability: string[];
	shAvailability: string[];
	description: string | null;
	catchPhrase: string | null;
}

// Posters / Music 공통 베이스 (두 카테고리 attributes 구조 동일)
interface _WithSimpleItem extends _WithBuySell, _WithColors, _WithHHABase {
	size: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group A: 가구류
//  Housewares / Miscellaneous / Wall-mounted / Ceiling Decor / Gyroids
// ═══════════════════════════════════════════════════════════

export interface HousewaresAttributes extends _WithFurnitureBase {
	surface: 'Yes' | 'No' | null;
	speakerType: string | null;
}

export interface MiscellaneousAttributes extends _WithFurnitureBase {
	surface: 'Yes' | 'No' | null;
	speakerType: string | null;
	stackSize: number | null;
	foodPower: number | null;
}

export interface WallMountedAttributes extends _WithFurnitureBase {
	doorDeco: 'Yes' | 'No' | null;
}

export interface CeilingDecorAttributes extends _WithFurnitureBase {
	surface: 'Yes' | 'No' | null;
}

export interface GyroidsAttributes extends _WithFurnitureBase {
	soundType: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group B: 인테리어
//  Wallpaper / Floors / Rugs
// ═══════════════════════════════════════════════════════════

export interface WallpaperAttributes extends _WithInteriorBase {
	vfx: 'Yes' | 'No' | null;
	vfxType: string | null;
	windowType: string | null;
	windowColor: string | null;
	paneType: string | null;
	curtainType: string | null;
	curtainColor: string | null;
	ceilingType: string | null;
}

export interface FloorsAttributes extends _WithInteriorBase {
	vfx: 'Yes' | 'No' | null;
}

export interface RugsAttributes extends _WithInteriorBase {
	size: string | null;
	sizeCategory: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group C: 의류
//  Tops / Bottoms / DressUps / Headwears / Accessories
//  Socks / Shoes / Bags / Umbrellas / Clothing Other
// ═══════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TopsAttributes extends _WithClothingBase {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BottomsAttributes extends _WithClothingBase {}

export interface DressUpsAttributes extends _WithClothingBase {
	primaryShape: string | null;
	secondaryShape: string | null;
}

export interface HeadwearsAttributes extends _WithClothingBase {
	type: string | null;
}

export interface AccessoriesAttributes extends _WithClothingBase {
	type: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SocksAttributes extends _WithClothingBase {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ShoesAttributes extends _WithClothingBase {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BagsAttributes extends _WithClothingBase {}

// Umbrellas는 style/label/seasonality 없는 단순 의류
export interface UmbrellasAttributes
	extends _WithBuySell, _WithColors, _WithDIY, _WithHHABase, _WithExchange {
	size: string | null;
	gender: string | null;
	villagerGender: string | null;
	villagerEquippable: 'Yes' | 'No' | null;
}

export interface ClothingOtherAttributes extends _WithClothingBase {
	primaryShape: string | null;
	secondaryShape: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group D: 소품
//  Photos / Posters / Music / Tools/Goods / Fencing / Recipes
// ═══════════════════════════════════════════════════════════

export interface PhotosAttributes extends _WithBuySell, _WithColors, _WithHHAFull, _WithExchange {
	size: string | null;
	diy: 'Yes' | 'No';
	customize: 'Yes' | 'No' | null;
	kitCost: number | null;
	cyrusCustomizePrice: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PostersAttributes extends _WithSimpleItem {}

export interface MusicAttributes extends _WithSimpleItem {
	framedImageUrl: string | null;
	albumImageUrl: string | null;
}

export interface ToolsGoodsAttributes
	extends _WithBuySell, _WithColors, _WithHHAFull, _WithExchange, _WithCustomize {
	size: string | null;
	diy: 'Yes' | 'No';
	uses: number | null;
	stackSize: number | null;
	foodPower: number | null;
	lightingType: string | null;
	villagerEquippable: 'Yes' | 'No' | null;
}

export interface FencingAttributes extends _WithBuySell, _WithDIY, _WithCustomize {
	stackSize: number | null;
}

export interface RecipesAttributes extends _WithNullableBuySell, _WithExchange {
	imageUrl: string | null;
	imageSHImageUrl: string | null;
	// 최대 6개 재료 — 없는 슬롯은 배열에서 제외
	materials: { quantity: number; material: string }[];
	recipesToUnlock: number | null;
	craftedItemInternalId: number | null;
	cardColor: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group E: 크리처
//  Insects / Fish / Sea Creatures
// ═══════════════════════════════════════════════════════════

export interface InsectsAttributes extends _WithCreatureBase {
	weather: string | null;
}

export interface FishAttributes extends _WithCreatureBase {
	shadow: string | null;
	catchDifficulty: string | null;
	vision: string | null;
	lightingType: string | null;
}

export interface SeaCreaturesAttributes extends _WithCreatureBase {
	shadow: string | null;
	movementSpeed: string | null;
	lightingType: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Group F: 수집품
//  Fossils / Artwork / Other
// ═══════════════════════════════════════════════════════════

export interface FossilsAttributes extends _WithColors, _WithHHABase {
	buy: number | 'NFS' | null;
	sell: number;
	catalog: string;
	source: string;
	size: string | null;
	fossilGroup: string | null;
	museum: string | null;
	interact: string | null;
	description: string | null;
}

export interface ArtworkAttributes extends _WithBuySell, _WithColors, _WithHHAFull {
	imageUrl: string | null;
	highResTextureImageUrl: string | null;
	size: string | null;
	genuine: 'Yes' | 'No' | null;
	realArtworkTitle: string | null;
	artist: string | null;
	description: string | null;
	interact: string | null;
	tag: string | null;
	speakerType: string | null;
	lightingType: string | null;
}

export interface OtherAttributes
	extends _WithNullableBuySell, _WithColors, _WithHHABase, _WithExchange {
	inventoryImageUrl: string | null;
	storageImageUrl: string | null;
	diy: 'Yes' | 'No';
	stackSize: number | null;
	tag: string | null;
	foodPower: number | null;
}

// ═══════════════════════════════════════════════════════════
//  CatalogItem (discriminated union — category가 discriminant)
// ═══════════════════════════════════════════════════════════

interface _BaseCatalogItem {
	id: string; // uniqueEntryId
	name: string;
	imageUrl: string;
	bodyTitle: string | null;
	patternTitle: string | null;
}

// boilerplate 30개 제거용 제네릭 헬퍼
type _CatalogItemOf<C extends string, A> = _BaseCatalogItem & { category: C; attributes: A };

export type HousewaresCatalogItem = _CatalogItemOf<'Housewares', HousewaresAttributes>;
export type MiscellaneousCatalogItem = _CatalogItemOf<'Miscellaneous', MiscellaneousAttributes>;
export type WallMountedCatalogItem = _CatalogItemOf<'Wall-mounted', WallMountedAttributes>;
export type CeilingDecorCatalogItem = _CatalogItemOf<'Ceiling Decor', CeilingDecorAttributes>;
export type GyroidsCatalogItem = _CatalogItemOf<'Gyroids', GyroidsAttributes>;
export type WallpaperCatalogItem = _CatalogItemOf<'Wallpaper', WallpaperAttributes>;
export type FloorsCatalogItem = _CatalogItemOf<'Floors', FloorsAttributes>;
export type RugsCatalogItem = _CatalogItemOf<'Rugs', RugsAttributes>;
export type TopsCatalogItem = _CatalogItemOf<'Tops', TopsAttributes>;
export type BottomsCatalogItem = _CatalogItemOf<'Bottoms', BottomsAttributes>;
export type DressUpsCatalogItem = _CatalogItemOf<'DressUps', DressUpsAttributes>;
export type HeadwearsCatalogItem = _CatalogItemOf<'Headwears', HeadwearsAttributes>;
export type AccessoriesCatalogItem = _CatalogItemOf<'Accessories', AccessoriesAttributes>;
export type SocksCatalogItem = _CatalogItemOf<'Socks', SocksAttributes>;
export type ShoesCatalogItem = _CatalogItemOf<'Shoes', ShoesAttributes>;
export type BagsCatalogItem = _CatalogItemOf<'Bags', BagsAttributes>;
export type UmbrellasCatalogItem = _CatalogItemOf<'Umbrellas', UmbrellasAttributes>;
export type ClothingOtherCatalogItem = _CatalogItemOf<'Clothing Other', ClothingOtherAttributes>;
export type PhotosCatalogItem = _CatalogItemOf<'Photos', PhotosAttributes>;
export type PostersCatalogItem = _CatalogItemOf<'Posters', PostersAttributes>;
export type MusicCatalogItem = _CatalogItemOf<'Music', MusicAttributes>;
export type ToolsGoodsCatalogItem = _CatalogItemOf<'Tools/Goods', ToolsGoodsAttributes>;
export type FencingCatalogItem = _CatalogItemOf<'Fencing', FencingAttributes>;
export type RecipesCatalogItem = _CatalogItemOf<'Recipes', RecipesAttributes>;
export type InsectsCatalogItem = _CatalogItemOf<'Insects', InsectsAttributes>;
export type FishCatalogItem = _CatalogItemOf<'Fish', FishAttributes>;
export type SeaCreaturesCatalogItem = _CatalogItemOf<'Sea Creatures', SeaCreaturesAttributes>;
export type FossilsCatalogItem = _CatalogItemOf<'Fossils', FossilsAttributes>;
export type ArtworkCatalogItem = _CatalogItemOf<'Artwork', ArtworkAttributes>;
export type OtherCatalogItem = _CatalogItemOf<'Other', OtherAttributes>;

export type CatalogItem =
	| HousewaresCatalogItem
	| MiscellaneousCatalogItem
	| WallMountedCatalogItem
	| CeilingDecorCatalogItem
	| GyroidsCatalogItem
	| WallpaperCatalogItem
	| FloorsCatalogItem
	| RugsCatalogItem
	| TopsCatalogItem
	| BottomsCatalogItem
	| DressUpsCatalogItem
	| HeadwearsCatalogItem
	| AccessoriesCatalogItem
	| SocksCatalogItem
	| ShoesCatalogItem
	| BagsCatalogItem
	| UmbrellasCatalogItem
	| ClothingOtherCatalogItem
	| PhotosCatalogItem
	| PostersCatalogItem
	| MusicCatalogItem
	| ToolsGoodsCatalogItem
	| FencingCatalogItem
	| RecipesCatalogItem
	| InsectsCatalogItem
	| FishCatalogItem
	| SeaCreaturesCatalogItem
	| FossilsCatalogItem
	| ArtworkCatalogItem
	| OtherCatalogItem;

// ─── CatalogVariant (서브컬렉션) ──────────────────────────────────────────────

export interface CatalogVariant {
	id: string; // uniqueEntryId
	variantId: string; // "2_0" — split("_")으로 bodyIndex/patternIndex 파싱
	body: string | null;
	pattern: string | null;
	imageUrl: string;
}
