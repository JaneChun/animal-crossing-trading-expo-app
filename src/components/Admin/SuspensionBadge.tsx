import { Timestamp } from 'firebase/firestore';

import Badge from '@/components/ui/Badge';
import { formatKstMonthDay } from '@/utilities/kstDate';
import { isPermanentSuspension, isSuspended } from '@/utilities/sanction';

// 정지 중이면 "12.14까지 정지"(영구 정지는 "영구 정지") 칩, 아니면 그리지 않는다
const SuspensionBadge = ({ suspendUntil }: { suspendUntil: Timestamp | null | undefined }) => {
	if (!isSuspended(suspendUntil)) return null;

	const text = isPermanentSuspension(suspendUntil)
		? '영구 정지'
		: `${formatKstMonthDay(suspendUntil.toDate())}까지 정지`;
	return <Badge text={text} tone="danger" />;
};

// 관리자 화면들이 이 파일에서 가져다 쓰므로 그대로 내보낸다
export { isSuspended };

// 관리자 조치 패널의 정지 상태 설명
export const getSuspensionDescription = (suspendUntil: Timestamp): string =>
	isPermanentSuspension(suspendUntil)
		? '영구 정지 중'
		: `${formatKstMonthDay(suspendUntil.toDate())} 0시까지 정지 중`;

export default SuspensionBadge;
