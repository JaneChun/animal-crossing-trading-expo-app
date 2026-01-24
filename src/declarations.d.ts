// Image file types
declare module '*.png' {
	const value: number;
	export default value;
}

declare module '*.jpg' {
	const value: number;
	export default value;
}

declare module '*.jpeg' {
	const value: number;
	export default value;
}

declare module '*.gif' {
	const value: number;
	export default value;
}

declare module '*.webp' {
	const value: number;
	export default value;
}

declare module 'cenkor' {
	interface FilterEntry {
		word: string;
		from: number;
		to: number;
	}
	interface Result {
		filtered: boolean;
		filters: Record<string, FilterEntry[]>;
	}
	function cenkor(input: string): Result;
	export default cenkor;
}
