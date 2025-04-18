import { showToast } from '@/components/ui/Toast';
import { goBack } from '@/navigation/RootNavigation';
import {
	buildCreatePostRequestParams,
	buildUpdatePostRequestParams,
	Collection,
	createPostFlowParams,
	CreatePostRequest,
	updatePostFlowParams,
	UpdatePostRequest,
	usePostSubmitParams,
} from '@/types/post';
import { popToPostDetail } from '@/utilities/navigationHelpers';

export const usePostSubmit = <C extends Collection>({
	collectionName,
	resetAll,
	createPost,
	updatePost,
}: usePostSubmitParams<C>) => {
	const buildCreatePostRequest = ({
		collectionName,
		imageUrls,
		form,
	}: buildCreatePostRequestParams<C>): CreatePostRequest<C> => {
		const { type, title, body } = form;

		const base = {
			type,
			title: title.trim(),
			body: body.trim(),
		};

		if (collectionName === 'Boards') {
			const { cart } = form as CreatePostRequest<'Boards'>;
			return {
				...base,
				cart,
			} as CreatePostRequest<C>;
		} else {
			return {
				...base,
				images: imageUrls,
			} as CreatePostRequest<C>;
		}
	};

	const buildUpdatePostRequest = ({
		collectionName,
		imageUrls,
		form,
	}: buildUpdatePostRequestParams<C>): UpdatePostRequest<C> => {
		const { type, title, body } = form;

		const base = {
			type,
			title: title?.trim(),
			body: body?.trim(),
		};

		if (collectionName === 'Boards') {
			const { cart } = form as CreatePostRequest<'Boards'>;
			return {
				...base,
				cart,
			} as CreatePostRequest<C>;
		} else {
			return {
				...base,
				images: imageUrls,
			} as CreatePostRequest<C>;
		}
	};

	const createPostFlow = async ({
		imageUrls,
		form,
		userId,
	}: createPostFlowParams<C>) => {
		const requestData: CreatePostRequest<C> = buildCreatePostRequest({
			collectionName,
			imageUrls,
			form,
		});
		createPost(
			{ requestData, userId },
			{
				onSuccess: (id: string) => {
					resetAll();

					popToPostDetail({ postId: id, collectionName });
					showToast('success', '게시글이 작성되었습니다.');
				},
				onError: () => {
					showToast('error', '게시글 작성 중 오류가 발생했습니다.');
				},
			},
		);
	};

	const updatePostFlow = async ({
		imageUrls,
		form,
	}: updatePostFlowParams<C>) => {
		const data: UpdatePostRequest<C> = buildUpdatePostRequest({
			collectionName,
			imageUrls,
			form,
		});
		updatePost(data, {
			onSuccess: () => {
				resetAll();
				goBack();
				showToast('success', '게시글이 수정되었습니다.');
			},
			onError: () => {
				showToast('error', '게시글 수정 중 오류가 발생했습니다.');
			},
		});
	};

	return {
		createPostFlow,
		updatePostFlow,
	};
};
