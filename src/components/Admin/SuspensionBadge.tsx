import { Timestamp } from 'firebase/firestore';

import Badge from '@/components/ui/Badge';
import { formatKstMonthDay } from '@/utilities/kstDate';

// 정지 중이면 "12.14까지 정지" 칩, 아니면 그리지 않는다
const SuspensionBadge = ({ suspendUntil }: { suspendUntil: Timestamp | null | undefined }) => {
	if (!isSuspended(suspendUntil)) return null;

	return <Badge text={`${formatKstMonthDay(suspendUntil.toDate())}까지 정지`} tone="danger" />;
};

export const isSuspended = (
	suspendUntil: Timestamp | null | undefined,
): suspendUntil is Timestamp => !!suspendUntil && suspendUntil.toMillis() > Date.now();

export default SuspensionBadge;
