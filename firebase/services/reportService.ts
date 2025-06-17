import { showToast } from '@/components/ui/Toast';
import { CreateReportRequest } from '@/types/report';
import { Timestamp } from '@google-cloud/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import { addDocToFirestore } from '../core/firestoreService';
import { updateUserReport } from './userService';

export const createReport = async (requestData: CreateReportRequest) => {
	return firestoreRequest('유저 신고', async () => {
		// 신고 생성
		const createdId = await addDocToFirestore({
			directory: 'Report',
			requestData: {
				...requestData,
				createdAt: Timestamp.now(),
				resolved: false,
			},
		});

		// 사용자 데이터 수정
		await updateUserReport({
			userId: requestData.reporteeId,
		});

		showToast('success', '신고가 접수되었습니다.');

		return createdId;
	});
};
