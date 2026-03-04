import fruitApple from '@assets/images/profile/apple.png';
import fruitCherry from '@assets/images/profile/cherry.png';
import fruitOrange from '@assets/images/profile/orange.png';
import fruitPeach from '@assets/images/profile/peach.png';
import fruitPear from '@assets/images/profile/pear.png';

export const PUBLIC_USER_INFO_STALE_TIME = 30 * 60 * 1000;

export const FRUIT_IMAGES = {
	apple: fruitApple,
	cherry: fruitCherry,
	orange: fruitOrange,
	peach: fruitPeach,
	pear: fruitPear,
} as const;

export const FRUIT_NAMES = {
	apple: '사과',
	cherry: '체리',
	orange: '오렌지',
	peach: '복숭아',
	pear: '배',
};
