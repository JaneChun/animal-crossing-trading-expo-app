import { CatalogItem } from '@/types/catalog';

export const MAX_REVIEW_CANDIDATES = 2;

export type MatchSource = 'original' | 'cleaned';

export type CatalogItemCandidate = {
	id: string;
	name: string;
	category: string;
	imageUrl: string;
	item: CatalogItem;
};

export type FoundLineMatchResult = {
	line: string;
	status: 'found';
	item: CatalogItem;
};

export type NeedsReviewLineMatchResult = {
	line: string;
	status: 'needsReview';
	searchTerm: string;
	source: MatchSource;
	candidates: CatalogItemCandidate[];
};

export type FailedLineMatchResult = {
	line: string;
	status: 'failed';
};

export type BulkLineMatchResult =
	| FoundLineMatchResult
	| NeedsReviewLineMatchResult
	| FailedLineMatchResult;

export type ClassifyCatalogHitsParams = {
	line: string;
	searchTerm: string;
	source: MatchSource;
	hits: CatalogItem[];
};

export const normalizeItemText = (value: string): string => value.trim().replace(/\s+/g, ' ');

const stripTradingSuffixes = (value: string): string =>
	value
		.replace(/\d+\s*(개|마일|덩|벨)/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const pushUnique = (values: string[], next: string) => {
	const normalized = normalizeItemText(next);
	if (normalized && !values.includes(normalized)) values.push(normalized);
};

export const buildCleanedSearchTerms = (line: string): string[] => {
	const terms: string[] = [];
	const normalized = normalizeItemText(line);
	const withoutSuffixes = stripTradingSuffixes(normalized);
	const beforeSeparator = withoutSuffixes.split(/\s[-,/|]\s|[-,/|]/)[0] ?? '';
	const parenthesized = beforeSeparator.match(/\(([^)]+)\)/)?.[1];
	const base = beforeSeparator.replace(/\([^)]*\)/g, ' ');

	pushUnique(terms, base);
	if (parenthesized) pushUnique(terms, `${base} ${parenthesized}`);

	return terms.filter((term) => term !== normalized);
};

export const toCatalogItemCandidate = (item: CatalogItem): CatalogItemCandidate => ({
	id: item.id,
	name: item.name,
	category: item.category,
	imageUrl: item.imageUrl,
	item,
});

const getExactHits = (searchTerm: string, hits: CatalogItem[]): CatalogItem[] => {
	const normalizedSearchTerm = normalizeItemText(searchTerm);
	return hits.filter((hit) => normalizeItemText(hit.name) === normalizedSearchTerm);
};

export const classifyCatalogHits = ({
	line,
	searchTerm,
	source,
	hits,
}: ClassifyCatalogHitsParams): BulkLineMatchResult => {
	const exactHits = getExactHits(searchTerm, hits);
	const candidates = (exactHits.length > 0 ? exactHits : hits)
		.slice(0, MAX_REVIEW_CANDIDATES)
		.map(toCatalogItemCandidate);

	if (candidates.length === 0) return { line, status: 'failed' };

	if (source === 'original' && exactHits.length === 1) {
		return { line, status: 'found', item: exactHits[0] };
	}

	return {
		line,
		status: 'needsReview',
		searchTerm,
		source,
		candidates,
	};
};
