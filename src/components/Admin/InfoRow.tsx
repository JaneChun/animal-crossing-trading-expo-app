import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import SettingListItem from '@/components/Profile/SettingListItem';
import Text from '@/components/ui/Text';
import { Spacing } from '@/theme';

type InfoRowProps = {
	label: string;
	/** 문자열이면 text.secondary 글자, 그 외에는 Badge·아이콘+텍스트 등 그대로 표시 */
	value: ReactNode;
	borderRound?: 'top' | 'bottom' | 'all';
};

// SettingListItem의 값 표시형
const InfoRow = ({ label, value, borderRound }: InfoRowProps) => {
	return (
		<SettingListItem borderRound={borderRound}>
			<View style={styles.content}>
				<Text variant="body1" style={styles.label}>
					{label}
				</Text>
				{typeof value === 'string' ? (
					<Text variant="body1" color="secondary" numberOfLines={1} style={styles.value}>
						{value}
					</Text>
				) : (
					value
				)}
			</View>
		</SettingListItem>
	);
};

export default InfoRow;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: Spacing.m,
	},
	label: {
		flexShrink: 0,
	},
	value: {
		flexShrink: 1,
	},
});
