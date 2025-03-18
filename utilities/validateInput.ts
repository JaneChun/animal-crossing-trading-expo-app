export const VALIDATION_RULES = {
	postTitle: {
		min: 1,
		max: 50,
		required: true,
		label: '제목',
	},
	postBody: {
		min: 1,
		max: 3000,
		required: true,
		label: '내용',
	},
	comment: {
		min: 1,
		max: 3000,
		required: true,
		label: '댓글',
	},
	chatMessage: {
		min: 1,
		max: 3000,
		required: true,
		label: '메세지',
	},
	displayName: {
		min: 1,
		max: 10,
		required: true,
		label: '닉네임',
	},
	islandName: {
		min: 1,
		max: 10,
		required: true,
		label: '섬 이름',
	},
};

export const validateInput = (
	type: keyof typeof VALIDATION_RULES,
	text: string,
): string => {
	const trimmedText = text.trim();
	const { min, max, required, label } = VALIDATION_RULES[type];

	// 빈 문자열 검사
	if (required && trimmedText.length < min) {
		return `${label}${getPostposition(label, '을/를')} 입력해주세요.`;
	}

	// 최대 글자수 검사
	if (trimmedText.length > max) {
		return `${label}${getPostposition(
			label,
			'은/는',
		)} 최대 ${max}자까지 입력 가능합니다.`;
	}

	// 닉네임 & 섬 이름 문자 검사
	if (type === 'displayName' || type === 'islandName') {
		if (!/^[a-zA-Z0-9가-힣]+$/.test(text)) {
			return `${label}${getPostposition(
				label,
				'은/는',
			)} 띄어쓰기 없이 한글, 영문, 숫자만 가능합니다.`;
		}
	}

	return '';
};

// 받침이 있는지 확인하는 함수
const hasFinalConsonant = (word: string): boolean => {
	if (!word) return false;

	const lastChar = word[word.length - 1]; // 마지막 글자
	const code = lastChar.charCodeAt(0);

	return (code - 44032) % 28 !== 0; // 받침이 있으면 true
};

// 적절한 조사를 반환하는 함수
const getPostposition = (word: string, type: '은/는' | '을/를') => {
	const hasConsonant = hasFinalConsonant(word);

	if (type === '은/는') {
		return hasConsonant ? '은' : '는';
	} else if (type === '을/를') {
		return hasConsonant ? '을' : '를';
	}

	return '';
};
