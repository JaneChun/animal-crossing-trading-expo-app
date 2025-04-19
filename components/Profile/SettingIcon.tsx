import { Colors } from '@/constants/Color';
import { navigateToSetting } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const SettingIcon = (
	<TouchableOpacity style={{ paddingRight: 5 }} onPress={navigateToSetting}>
		<Ionicons name='settings-outline' color={Colors.font_gray} size={24} />
	</TouchableOpacity>
);

export default SettingIcon;
