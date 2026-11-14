import { Timestamp } from 'firebase/firestore';

import Badge from '@/components/ui/Badge';
import { formatKstMonthDay } from '@/utilities/kstDate';

// 정지 중이면 "12.14까지 정지"(영구 정지는 "영구 정지") 칩, 아니면 그리지 않는다
const SuspensionBadge = ({ suspendUntil }: { suspendUntil: Timestamp | null | undefined }) => {
	if (!isSuspended(suspendUntil)) return null;

	const text = isPermanentSuspension(suspendUntil)
		? '영구 정지'
		: `${formatKstMonthDay(suspendUntil.toDate())}까지 정지`;
	return <Badge text={text} tone="danger" />;
};

export const isSuspended = (
	suspendUntil: Timestamp | null | undefined,
): suspendUntil is Timestamp => !!suspendUntil && suspendUntil.toMillis() > Date.now();

// 영구 정지는 suspendUntil에 9999-12-31을 넣는다(functions/src/admin/sanction.ts의 PERMANENT_SUSPEND_UNTIL)
export const isPermanentSuspension = (suspendUntil: Timestamp): boolean =>
	suspendUntil.toDate().getUTCFullYear() >= 9999;

// 관리자 조치 패널의 정지 상태 설명
export const getSuspensionDescription = (suspendUntil: Timestamp): string =>
	isPermanentSuspension(suspendUntil)
		? '영구 정지 중'
		: `${formatKstMonthDay(suspendUntil.toDate())} 0시까지 정지 중`;

export default SuspensionBadge;
