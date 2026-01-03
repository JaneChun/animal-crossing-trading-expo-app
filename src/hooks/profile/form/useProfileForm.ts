import { useUserInfo } from '@/stores/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProfileFormSchema, ProfileFormValues } from './profileFormSchema';

export const useProfileForm = () => {
	const userInfo = useUserInfo();

	const methods = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileFormSchema),
		mode: 'onChange',
		defaultValues: {
			displayName: userInfo?.displayName || '',
			islandName: userInfo?.islandName || '',
			image: userInfo?.photoURL ? { uri: userInfo.photoURL } : null, // ImagePicker로 추가한 이미지
			originalImageUrl: userInfo?.photoURL || '', // Firestore에서 가져온 기존 이미지
		},
	});

	return methods;
};
