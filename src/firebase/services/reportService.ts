import { collection, deleteField, query, Timestamp, where } from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import {
	addDocToFirestore,
	queryDocs,
	updateDocToFirestore,
} from '@/firebase/core/firestoreService';
import { CreateReportRequest } from '@/types/report';

const REPORT_TARGET_FIELDS = [
	'collectionName',
	'postId',
	'commentId',
	'replyId',
	'chatId',
] as const;

export const createReport = async (requestData: CreateReportRequest) => {
	return firestoreRequest(
		'유저 신고',
		async () => {
			const { reporterId, reporteeId } = requestData;

			const q = query(
				collection(db, 'Reports'),
				where('reporterId', '==', reporterId),
				where('reporteeId', '==', reporteeId),
			);

			// 신고 시점 스냅샷(snapshot)은 onReportWritten 함수가 기록한다. 신고자가 조작할 수 없게 앱에서는 쓰지 않는다
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
				// 덮어쓰기라서, 이번 신고에 없는 대상 필드는 지워야 이전 신고 대상이 남지 않는다
				const clearedTargetFields = Object.fromEntries(
					REPORT_TARGET_FIELDS.filter((field) => !requestData[field]).map((field) => [
						field,
						deleteField(),
					]),
				);
				const updatedReportData = {
					...clearedTargetFields,
					...requestData,
					createdAt: Timestamp.now(),
					resolved: false,
				};

				await updateDocToFirestore({
					collection: 'Reports',
					id: existingReports[0].id,
					requestData: updatedReportData,
				});
			}
		},
		{ throwOnError: true },
	);
};
