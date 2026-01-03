import { useEffect, useState } from 'react';

// 사용자의 입력이 멈춘 뒤, 지정된 시간(delay)이 지나야 값이 반영되도록 디바운싱 처리
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// 1. value가 바뀔 때마다 새로운 타이머를 설정
		const handler = setTimeout(() => {
			// 3. delay 시간이 지나면 debouncedValue를 업데이트
			setDebouncedValue(value);
		}, delay);

		// 2. 다음 useEffect 실행 전, 이전 타이머를 정리하여 중복 호출을 방지
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}
