/**
 * common.ts 모듈 단위 테스트
 * Firebase 관련 공통 유틸리티 함수들을 테스트합니다
 */

import { createMockFirebaseAdmin } from '../helpers';

// Firebase Admin SDK 전체를 Mock으로 대체 - 공통 헬퍼 활용
jest.mock('firebase-admin', () => createMockFirebaseAdmin());

import {
	db,
	getSafeUid,
	isUserRestrictedFromRejoining,
	truncateText,
} from '../../src/utils/common';

describe('common 유틸리티 함수 테스트', () => {
	describe('getSafeUid 함수', () => {
		it('점(.)이 포함된 UID를 안전한 형태로 변환해야 한다', () => {
			// Apple 로그인 시 provider ID에 점이 포함될 수 있음
			const uidWithDots = '000123.456abc.789def';

			const result = getSafeUid(uidWithDots);

			// 모든 점이 제거되어야 함
			expect(result).toBe('000123456abc789def');
			expect(result).not.toContain('.');
		});

		it('점이 없는 UID는 그대로 반환해야 한다', () => {
			const normalUid = 'kakao123456789';

			const result = getSafeUid(normalUid);

			expect(result).toBe('kakao123456789');
		});

		it('빈 문자열도 처리해야 한다', () => {
			const emptyUid = '';

			const result = getSafeUid(emptyUid);

			expect(result).toBe('');
		});

		/**
		 * 실제 앱에서 사용되는 시나리오 테스트
		 * Firestore의 필드명으로 UID를 사용할 때 점이 있으면 중첩 구조로 저장되는 문제 발생
		 */
		it('Firestore 필드명 사용 시나리오를 시뮬레이션해야 한다', () => {
			const appleUid = '001234.56789abcdef.fedcba98765';

			// 채팅방에서 각 사용자의 읽지 않은 메시지 수를 저장할 때 unreadCount.{safeUid} 형태로 필드를 만듦
			const safeUid = getSafeUid(appleUid);
			const fieldName = `unreadCount.${safeUid}`;

			expect(fieldName).toBe('unreadCount.00123456789abcdeffedcba98765');

			// Firestore에서 사용 가능한 필드명인지 확인 (점이 하나만 있어야 함)
			expect(fieldName.split('.').length).toBe(2);
		});
	});

	describe('truncateText 함수', () => {
		it('텍스트가 최대 길이보다 짧으면 그대로 반환해야 한다', () => {
			const text = '안녕하세요';
			const maxLength = 10;

			const result = truncateText(text, maxLength);

			expect(result).toBe('안녕하세요');
		});

		it('텍스트가 최대 길이보다 길면 잘라내고 ...을 추가해야 한다', () => {
			const text = '안녕하세요 모동숲 마켓입니다';
			const maxLength = 7;

			const result = truncateText(text, maxLength);

			// 7글자 + '...' = '안녕하세요 모...'
			expect(result).toBe('안녕하세요 모...');
			expect(result).toHaveLength(maxLength + 3); // 원래 길이 + '...'
		});

		it('텍스트가 정확히 최대 길이와 같으면 그대로 반환해야 한다', () => {
			const text = '정확히';
			const maxLength = 3;

			const result = truncateText(text, maxLength);

			expect(result).toBe('정확히');
		});

		it('빈 문자열은 그대로 반환해야 한다', () => {
			const text = '';
			const maxLength = 5;

			const result = truncateText(text, maxLength);

			expect(result).toBe('');
		});

		/**
		 * 실제 앱에서 사용되는 시나리오 테스트
		 * 댓글이나 채팅 메시지를 50자로 자르는 경우
		 */
		it('실제 채팅 메시지 시나리오를 처리해야 한다', () => {
			const longMessage =
				'안녕하세요! 오늘 동물의숲에서 철광석 10개와 나무 20개를 교환하고 싶은데 혹시 가능하실까요? 제가 가진 아이템도 많이 있어서 다른 것도 교환 가능합니다!';
			const maxLength = 50;

			const result = truncateText(longMessage, maxLength);

			expect(result).toHaveLength(53); // 50 + '...'
			expect(result.endsWith('...')).toBe(true);
		});
	});

	describe('isUserRestrictedFromRejoining 함수', () => {
		it('30일 이내에 삭제된 사용자는 재가입이 제한되어야 한다', async () => {
			const providerId = 'restrictedUser123';

			// 20일 전에 삭제된 사용자 데이터
			const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
			const mockDocData = {
				deletedAt: {
					toDate: () => twentyDaysAgo,
				},
			};

			// db.doc().get() 체이닝을 Mock으로 설정
			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => mockDocData,
			});

			// db 객체의 doc과 get 메서드를 Mock
			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			// 함수 실행
			const result = await isUserRestrictedFromRejoining(providerId);

			// 결과 검증
			expect(result).toBe(true);

			// Mock 호출 검증
			expect(db.doc).toHaveBeenCalledWith(`DeletedUsers/${providerId}`);
			expect(mockGet).toHaveBeenCalled();
		});

		it('30일 이후에 삭제된 사용자는 재가입이 허용되어야 한다', async () => {
			const providerId = 'allowedUser456';

			// 40일 전에 삭제된 사용자 데이터
			const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
			const mockDocData = {
				deletedAt: {
					toDate: () => fortyDaysAgo,
				},
			};

			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => mockDocData,
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			const result = await isUserRestrictedFromRejoining(providerId);

			expect(result).toBe(false);
		});

		it('삭제 기록이 없는 사용자는 재가입이 허용되어야 한다', async () => {
			const providerId = 'newUser789';

			const mockGet = jest.fn().mockResolvedValue({
				exists: false,
				data: () => null,
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			const result = await isUserRestrictedFromRejoining(providerId);

			expect(result).toBe(false);
			expect(db.doc).toHaveBeenCalledWith(`DeletedUsers/${providerId}`);
		});

		it('정확히 30일째 되는 사용자는 재가입이 허용되어야 한다', async () => {
			const providerId = 'borderlineUser';

			// 정확히 30일 전 (경계값 테스트)
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
			const mockDocData = {
				deletedAt: {
					toDate: () => thirtyDaysAgo,
				},
			};

			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => mockDocData,
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			const result = await isUserRestrictedFromRejoining(providerId);

			// 30일이 지났으므로 허용되어야 함
			expect(result).toBe(false);
		});

		/**
		 * 에러 상황 테스트:
		 * Firestore 호출이 실패하는 경우 어떻게 처리되는가?
		 * 새로운 defensive programming: 에러 발생 시 false 리턴 (회원가입 허용)
		 */
		it('Firestore 에러가 발생하면 에러를 throw해야 한다', async () => {
			const providerId = 'errorUser';

			const mockGet = jest
				.fn()
				.mockRejectedValue(new Error('Firestore connection failed'));

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			await expect(isUserRestrictedFromRejoining(providerId)).rejects.toThrow(
				'Firestore connection failed',
			);

			// Firestore 호출은 시도되었는지 확인
			expect(db.doc).toHaveBeenCalledWith(`DeletedUsers/${providerId}`);
			expect(mockGet).toHaveBeenCalled();
		});

		/**
		 * 데이터 무결성 테스트:
		 * 잘못된 형태의 데이터가 저장되어 있는 경우
		 * 새로운 defensive programming: 에러 대신 false 리턴 (회원가입 허용)
		 */
		it('deletedAt 필드가 없는 경우 false를 리턴해야 한다 (회원가입 허용)', async () => {
			const providerId = 'corruptedDataUser';

			// deletedAt 필드가 없는 경우
			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => ({
					// deletedAt 필드가 없음
					displayName: '데이터오류유저',
				}),
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			// deletedAt 필드가 없어도 에러 대신 false 리턴 (회원가입 허용)
			const result = await isUserRestrictedFromRejoining(providerId);
			expect(result).toBe(false);

			// Firestore 호출이 정상적으로 이루어졌는지 확인
			expect(db.doc).toHaveBeenCalledWith(`DeletedUsers/${providerId}`);
			expect(mockGet).toHaveBeenCalled();
		});

		it('data() 메서드가 null을 리턴하는 경우 false를 리턴해야 한다', async () => {
			const providerId = 'nullDataUser';

			// data()가 null을 리턴하는 경우
			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => null,
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			// data가 null이어도 에러 대신 false 리턴 (회원가입 허용)
			const result = await isUserRestrictedFromRejoining(providerId);
			expect(result).toBe(false);
		});

		it('deletedAt이 잘못된 타입인 경우 false를 리턴해야 한다', async () => {
			const providerId = 'invalidTypeUser';

			// deletedAt이 문자열인 경우 (toDate 메서드가 없음)
			const mockGet = jest.fn().mockResolvedValue({
				exists: true,
				data: () => ({
					deletedAt: '2024-01-01', // 문자열 (Timestamp가 아님)
					displayName: '잘못된타입유저',
				}),
			});

			(db.doc as jest.Mock).mockReturnValue({
				get: mockGet,
			});

			// 잘못된 타입이어도 에러 대신 false 리턴 (회원가입 허용)
			const result = await isUserRestrictedFromRejoining(providerId);
			expect(result).toBe(false);
		});
	});
});
