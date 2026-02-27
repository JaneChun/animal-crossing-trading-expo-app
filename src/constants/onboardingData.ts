export interface OnboardingStep {
	step: number;
	image: number; // 로컬 이미지
	title: string;
	description: string;
	buttonText: string;
}

export const ONBOARDING_DATA: OnboardingStep[] = [
	{
		step: 0,
		image: require('../../assets/images/onboarding/post.webp'), // 글 작성 스크린샷
		title: '원하는 아이템이 있다면 \n거래글을 올려보세요',
		description: '구해요/팔아요 태그를 선택해 글을 작성하면 다른 유저들이 댓글을 남겨요.',
		buttonText: '다음',
	},
	{
		step: 1,
		image: require('../../assets/images/onboarding/comment.webp'), // 댓글에 채팅하기 버튼 활성화 스크린샷
		title: '댓글이 달리면 \n채팅하기 버튼이 나타나요',
		description:
			'글 작성자에게만 채팅하기 버튼이 나타나 원하는 상대와 채팅을 시작할 수 있어요.',
		buttonText: '다음',
	},
	{
		step: 2,
		image: require('../../assets/images/onboarding/chat.webp'), // 채팅방 스크린샷
		title: '1:1 채팅에서 약속을 잡고 \n게임에서 거래해요',
		description: '채팅으로 섬 코드와 약속 시간을 공유하고, 게임 안에서 만나 거래해요.',
		buttonText: '다음',
	},
	{
		step: 3,
		image: require('../../assets/images/onboarding/market.webp'), // 마켓 일러스트
		title: '이제 모동숲 마켓을 \n시작해보세요!',
		description: '즐거운 거래를 위해 서로를 배려하는 매너를 잊지 마세요. 😊',
		buttonText: '시작하기',
	},
];
