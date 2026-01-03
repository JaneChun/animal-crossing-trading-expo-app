export interface BlockStoreState {
	blockedUsers: string[];
	setBlockedUsers: (ids: string[]) => void;
	blockedBy: string[];
	setBlockedBy: (ids: string[]) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
}

export interface BlockActions {
	clearBlocks: () => void;
	resetStore: () => void;
}

export interface BlockStore extends BlockStoreState, BlockActions {}