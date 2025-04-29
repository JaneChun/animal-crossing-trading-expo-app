import { Colors } from '@/constants/Color';
import { navigateToSetting } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

const SettingIcon = (
	<Pressable style={{ paddingRight: 5 }} onPress={navigateToSetting}>
		<Ionicons name='settings-outline' color={Colors.font_gray} size={24} />
	</Pressable>
);

export default SettingIcon;
