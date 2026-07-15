/**
 * 배열을 지정한 크기 단위로 쪼갠다.
 * Firestore `in` 쿼리(10개)나 Algolia 멀티쿼리(50개)처럼 요청당 상한이 있는 배치 조회에 사용.
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
};
