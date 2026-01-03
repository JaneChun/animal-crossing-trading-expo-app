import { db } from '@/config/firebase';
import { CreateReportRequest } from '@/types/report';
import { collection, query, Timestamp, where } from 'firebase/firestore';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import {
	addDocToFirestore,
	queryDocs,
	updateDocToFirestore,
} from '@/firebase/core/firestoreService';

export const createReport = async (requestData: CreateReportRequest) => {
	return firestoreRequest('유저 신고', async () => {
		const { reporterId, reporteeId } = requestData;

		const q = query(
			collection(db, 'Reports'),
			where('reporterId', '==', reporterId),
			where('reporteeId', '==', reporteeId),
		);

		const existingReports = await queryDocs(q);

		if (existingReports.length === 0) {
			// 새 신고 생성
			const createdId = await addDocToFirestore({
				directory: 'Reports',
				requestData: {
					...requestData,
					createdAt: Timestamp.now(),
					resolved: false,
				},
			});

			return createdId;
		} else {
			// 기존 신고 문서 갱신
			const updatedReportData = {
				...requestData,
				createdAt: Timestamp.now(),
				resolved: false,
			};

			updateDocToFirestore({
				collection: 'Reports',
				id: existingReports[0].id,
				requestData: updatedReportData,
			});
		}
	});
};
