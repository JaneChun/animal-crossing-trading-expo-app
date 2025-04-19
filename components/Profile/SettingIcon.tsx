import { navigateToSetting } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const SettingIcon = (
	<TouchableOpacity style={{ paddingRight: 5 }} onPress={navigateToSetting}>
		<Ionicons name='settings-outline' color={Colors.font_gray} size={24} />
	</TouchableOpacity>
);

export default SettingIcon;
