import { useNavigationState } from '@react-navigation/native';

export const useCurrentTab = () => {
	const currentTab = useNavigationState((state) => {
		const route = state.routes[state.index].name; // 현재 활성화된 route 가져오기
		return route;
	});

	return currentTab;
};
