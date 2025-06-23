import cenkor from 'cenkor';

export const sanitize = (text: string): string => {
	const { filtered, filters } = cenkor(text);
	if (!filtered) return text;

	const ranges = Object.values(filters).flat() as {
		from: number;
		to: number;
	}[];

	// 문자별로 범위에 걸리면 '□'로 교체
	return [...text]
		.map((ch, i) =>
			ranges.some(({ from, to }) => i >= from && i <= to) ? '□' : ch,
		)
		.join('');
};
