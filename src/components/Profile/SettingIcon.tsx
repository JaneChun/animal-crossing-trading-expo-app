import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme';
import { navigateToSetting } from '@/utilities/navigationHelpers';

const SettingIcon = () => {
	const { colors } = useTheme();

	return (
		<Pressable style={{ paddingRight: 5 }} onPress={navigateToSetting} testID="settingButton">
			<Ionicons name="settings-outline" color={colors.text.tertiary} size={24} />
		</Pressable>
	);
};

export default SettingIcon;
