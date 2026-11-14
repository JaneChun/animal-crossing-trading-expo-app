import {
	addDaysToDateString,
	formatKstDateTime,
	formatKstMonthDay,
	getKstDateString,
} from '@/utilities/kstDate';

describe('getKstDateString', () => {
	it('UTC 15시 이후는 KST로 다음 날이다', () => {
		const utcAfternoon = new Date('2026-11-13T15:30:00Z');

		expect(getKstDateString(utcAfternoon)).toBe('2026-11-14');
	});

	it('UTC 15시 전은 KST로 같은 날이다', () => {
		const utcMorning = new Date('2026-11-13T14:59:59Z');

		expect(getKstDateString(utcMorning)).toBe('2026-11-13');
	});
});

describe('addDaysToDateString', () => {
	it('월 경계를 넘어 하루 전 날짜를 구한다', () => {
		expect(addDaysToDateString('2026-12-01', -1)).toBe('2026-11-30');
	});

	it('하루 뒤 날짜를 구한다', () => {
		expect(addDaysToDateString('2026-12-31', 1)).toBe('2027-01-01');
	});
});

describe('formatKstDateTime', () => {
	it('KST 기준 날짜와 오전·오후 12시간제 시각으로 표시한다', () => {
		const utc = new Date('2026-11-14T05:11:00Z');

		expect(formatKstDateTime(utc)).toBe('2026.11.14 오후 2:11');
	});

	it('KST 0시는 오전 12시로 표시한다', () => {
		const kstMidnight = new Date('2026-12-13T15:00:00Z');

		expect(formatKstDateTime(kstMidnight)).toBe('2026.12.14 오전 12:00');
	});
});

describe('formatKstMonthDay', () => {
	it('KST 기준 월.일을 표시한다', () => {
		expect(formatKstMonthDay(new Date('2026-12-13T15:00:00Z'))).toBe('12.14');
	});
});
