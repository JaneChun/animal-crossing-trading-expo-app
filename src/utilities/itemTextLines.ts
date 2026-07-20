import { MAX_ITEM_TEXT_LINES, MIN_ITEM_TEXT_LINES } from '@/constants/post';

export const getTrimmedNonEmptyLines = (text: string): string[] =>
	text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

export const getUniqueLines = (lines: string[]): string[] => [...new Set(lines)];

// 최대 붙여넣기 텍스트 줄 수 초과
export const isOverItemTextLineLimit = (text: string): boolean =>
	getTrimmedNonEmptyLines(text).length > MAX_ITEM_TEXT_LINES;

// 붙여넣기로 판단할 만큼 줄 수가 충분한지 (일반 타이핑은 멀티라인 삽입이 불가능)
export const isBulkItemText = (text: string): boolean =>
	getTrimmedNonEmptyLines(text).length >= MIN_ITEM_TEXT_LINES;

// 이전 텍스트 대비 새 텍스트에서 한 번의 변경으로 삽입된 부분을 추출 (공통 prefix/suffix 제외)
export const getInsertedText = (prev: string, next: string): string => {
	if (next.length <= prev.length) return '';

	let prefix = 0;
	while (prefix < prev.length && prev[prefix] === next[prefix]) {
		prefix++;
	}

	let suffix = 0;
	const maxSuffix = prev.length - prefix;
	while (
		suffix < maxSuffix &&
		prev[prev.length - 1 - suffix] === next[next.length - 1 - suffix]
	) {
		suffix++;
	}

	return next.slice(prefix, next.length - suffix);
};
