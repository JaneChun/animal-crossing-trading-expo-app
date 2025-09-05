import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import {
	CommonActions,
	createNavigationContainerRef,
	StackActions,
} from '@react-navigation/native';

type RouteName = keyof RootStackParamList;
type Params<N extends RouteName> = RootStackParamList[N];

/**  
	네비게이션 함수에 전달할 매개변수 튜플 타입
	- Params<N>이 undefined인 경우: 해당 화면은 params가 없으므로 name만 전달
	- Params<N>이 객체 타입인 경우: name, params 전달
*/
type NavigationArgs<N extends RouteName> = Params<N> extends undefined
	? [name: N]
	: [name: N, params: RootStackParamList[N]];

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <RouteName extends keyof RootStackParamList>(
	name: RouteName,
	params: RootStackParamList[RouteName],
) => {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name, params);
	}
};

export const navigateWithoutParams = <
	RouteName extends keyof RootStackParamList,
>(
	name: RouteName,
) => {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name);
	}
};

export const goBack = () => {
	if (navigationRef.isReady() && navigationRef.canGoBack()) {
		navigationRef.goBack();
	}
};

// 현재 화면 교체
export const replace = <N extends RouteName>(...args: NavigationArgs<N>): void => {
	const [name, params] = args;

	if (!navigationRef.isReady()) return;

	if (params === undefined) {
		navigationRef.dispatch(StackActions.replace(name));
	} else {
		navigationRef.dispatch(StackActions.replace(name, params));
	}
};

// 스택에 새 화면 추가
export const push = <N extends RouteName>(...args: NavigationArgs<N>) => {
	const [name, params] = args;

	if (!navigationRef.isReady()) return;

	if (params === undefined) {
		navigationRef.dispatch(StackActions.push(name));
	} else {
		navigationRef.dispatch(StackActions.push(name, params));
	}
};

// 해당 라우트까지 스택 pop
export const popTo = <N extends RouteName>(...args: NavigationArgs<N>) => {
	const [name, params] = args;

	if (!navigationRef.isReady()) return;

	if (params === undefined) {
		navigationRef.dispatch(StackActions.popTo(name));
	} else {
		navigationRef.dispatch(StackActions.popTo(name, params, { merge: true }));
	}
};

// 전체 스택 초기화
export const resetTo = <RouteName extends keyof RootStackParamList>(
	name: RouteName,
	params?: RootStackParamList[RouteName],
) => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name, params }],
			}),
		);
	}
};

// 스택에서 n개 pop
export const pop = (count: number = 1) => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.pop(count));
	}
};

// 스택 최상단으로 이동
export const popToTop = () => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.popToTop());
	}
};

// 탭 전환 (Tab.Navigator 내부에서만 동작)
export const navigateToTab = <TabName extends keyof RootStackParamList>(
	name: TabName,
) => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.navigate({
				name,
			}),
		);
	}
};

// 탭 전환 + 내부 스크린 이동
export const navigateToTabAndResetStack = <
	TabName extends keyof MainTabParamList,
>(
	tabName: TabName,
	initialRouteName: string,
) => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.navigate({
				name: 'MainTab',
				params: {
					screen: tabName,
					params: {
						screen: initialRouteName,
						// 추가로 필요한 params가 있다면 여기에
					},
				},
			}),
		);
	}
};
