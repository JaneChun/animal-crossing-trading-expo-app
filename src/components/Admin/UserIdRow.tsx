import { ReactNode } from 'react';

import Badge from '@/components/ui/Badge';
import { DEFAULT_USER_DISPLAY_NAME } from '@/constants/defaultUserInfo';
import { useCachedPublicUserInfo } from '@/hooks/shared/useCachedPublicUserInfo';
import { navigateToAdminUserDetail } from '@/utilities/navigationHelpers';

import { isSuspended } from './SuspensionBadge';
import UserRow from './UserRow';

type UserIdRowProps = {
	uid: string;
	/** 이름 옆에 정지 배지를 붙인다 */
	showSuspendedBadge?: boolean;
	subtitle?: ReactNode;
	right?: ReactNode;
};

// uid만으로 유저 행을 그린다. 누르면 그 유저의 관리자 유저 상세로 간다
const UserIdRow = ({ uid, showSuspendedBadge = false, subtitle, right }: UserIdRowProps) => {
	const { data: user } = useCachedPublicUserInfo(uid);

	// 탈퇴 유저는 기본 유저 정보로 그리고 이동을 막는다
	const isDeletedUser = user?.displayName === DEFAULT_USER_DISPLAY_NAME;
	const isUserSuspended = showSuspendedBadge && isSuspended(user?.report?.suspendUntil);

	return (
		<UserRow
			user={user ?? { displayName: '' }}
			isListItem
			onPress={user && !isDeletedUser ? () => navigateToAdminUserDetail({ uid }) : undefined}
			nameAccessory={isUserSuspended && <Badge text="정지" tone="danger" />}
			subtitle={subtitle}
			right={right}
		/>
	);
};

export default UserIdRow;
