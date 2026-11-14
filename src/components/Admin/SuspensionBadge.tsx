import { Timestamp } from 'firebase/firestore';

import { formatKstMonthDay } from '@/utilities/kstDate';
import { isPermanentSuspension, isSuspended } from '@/utilities/sanction';

// 관리자 화면들이 이 파일에서 가져다 쓰므로 그대로 내보낸다
export { isSuspended };

// 관리자 조치 패널의 정지 상태 설명
export const getSuspensionDescription = (suspendUntil: Timestamp): string =>
	isPermanentSuspension(suspendUntil)
		? '영구 정지 중'
		: `${formatKstMonthDay(suspendUntil.toDate())} 0시까지 정지 중`;
