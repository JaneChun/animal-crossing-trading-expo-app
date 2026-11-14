const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 기기 타임존과 무관하게 KST 기준 날짜(YYYY-MM-DD)를 구한다
export const getKstDateString = (date: Date): string =>
	new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

// YYYY-MM-DD에 days일을 더한 날짜
export const addDaysToDateString = (dateString: string, days: number): string =>
	new Date(Date.parse(`${dateString}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

// KST 기준 "2026.11.14"
export const formatKstDate = (date: Date): string => getKstDateString(date).replaceAll('-', '.');

// KST 기준 "11.14"
export const formatKstMonthDay = (date: Date): string => formatKstDate(date).slice(5);

// KST 기준 "2026.11.14 오후 2:11"
export const formatKstDateTime = (date: Date): string => {
	const kst = new Date(date.getTime() + KST_OFFSET_MS);
	const hours24 = kst.getUTCHours();
	const meridiem = hours24 < 12 ? '오전' : '오후';
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
	const minutes = String(kst.getUTCMinutes()).padStart(2, '0');

	return `${formatKstDate(date)} ${meridiem} ${hours12}:${minutes}`;
};
