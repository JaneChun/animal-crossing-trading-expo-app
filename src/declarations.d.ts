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
