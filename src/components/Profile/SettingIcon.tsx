import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { Colors } from '@/theme/Color';
import { navigateToSetting } from '@/utilities/navigationHelpers';

const SettingIcon = (
	<Pressable style={{ paddingRight: 5 }} onPress={navigateToSetting} testID="settingButton">
		<Ionicons name="settings-outline" color={Colors.text.tertiary} size={24} />
	</Pressable>
);

export default SettingIcon;
