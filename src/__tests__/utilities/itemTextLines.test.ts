import { MAX_ITEM_TEXT_LINES } from '@/constants/post';
import {
	getInsertedText,
	getTrimmedNonEmptyLines,
	getUniqueLines,
	isBulkItemText,
	isOverItemTextLineLimit,
} from '@/utilities/itemTextLines';

describe('itemTextLines', () => {
	it('줄 앞뒤 공백을 제거하고 빈 줄은 카운트에서 제외한다', () => {
		expect(getTrimmedNonEmptyLines(' 요트 \n\n   \n 소형 자동차  ')).toEqual([
			'요트',
			'소형 자동차',
		]);
	});

	it('중복된 내용도 본문에 있는 줄이면 각각 카운트한다', () => {
		expect(getTrimmedNonEmptyLines('요트\n요트\n 요트 ')).toEqual(['요트', '요트', '요트']);
	});

	it('검색할 줄은 앞뒤 공백을 제거하고 최초 등장 순서대로 중복을 제거한다', () => {
		const trimmedNonEmptyLines = getTrimmedNonEmptyLines(
			' 요트 \n소형 자동차\n요트\n 소형 자동차 ',
		);
		const uniqueSearchLines = getUniqueLines(trimmedNonEmptyLines);

		expect(uniqueSearchLines).toEqual(['요트', '소형 자동차']);
	});

	it('공백 제거 후 비어 있지 않은 줄이 제한을 초과하면 추출 제한 초과로 본다', () => {
		const maxLines = Array.from(
			{ length: MAX_ITEM_TEXT_LINES },
			(_, index) => `아이템${index}`,
		);
		const overMaxLines = Array.from(
			{ length: MAX_ITEM_TEXT_LINES + 1 },
			(_, index) => `아이템${index}`,
		);

		expect(isOverItemTextLineLimit(maxLines.join('\n'))).toBe(false);
		expect(isOverItemTextLineLimit(overMaxLines.join('\n'))).toBe(true);
	});

	describe('isBulkItemText', () => {
		it('비어 있지 않은 줄이 2줄 이상이면 아이템 목록 붙여넣기로 본다', () => {
			expect(isBulkItemText('요트\n소형 자동차')).toBe(true);
			expect(isBulkItemText('요트\n\n \n소형 자동차')).toBe(true);
		});

		it('한 줄 이하이면 붙여넣기로 보지 않는다', () => {
			expect(isBulkItemText('요트')).toBe(false);
			expect(isBulkItemText('요트\n  ')).toBe(false);
			expect(isBulkItemText('')).toBe(false);
		});
	});

	describe('getInsertedText', () => {
		it('빈 본문에 붙여넣으면 전체를 삽입분으로 본다', () => {
			expect(getInsertedText('', '요트\n소형 자동차')).toBe('요트\n소형 자동차');
		});

		it('기존 본문 끝에 붙여넣으면 추가된 부분만 반환한다', () => {
			expect(getInsertedText('팝니다\n', '팝니다\n요트\n소형 자동차')).toBe(
				'요트\n소형 자동차',
			);
		});

		it('기존 본문 중간에 붙여넣으면 삽입된 부분만 반환한다', () => {
			expect(getInsertedText('팝니다\n연락주세요', '팝니다\n요트\n마차\n연락주세요')).toBe(
				'요트\n마차\n',
			);
		});

		it('텍스트가 삭제되거나 변화가 없으면 빈 문자열을 반환한다', () => {
			expect(getInsertedText('요트\n마차', '요트')).toBe('');
			expect(getInsertedText('요트', '요트')).toBe('');
		});
	});
});
