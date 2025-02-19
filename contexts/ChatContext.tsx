import { createContext, useReducer } from 'react';
import { useAuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
	const { userInfo } = useAuthContext();

	const INITIAL_STATE = {
		counterpart: {},
		chatId: 'null',
	};

	const chatReducer = (state, action) => {
		switch (action.type) {
			case 'CHANGE_USER':
				return {
					counterpart: action.payload,
					chatId:
						userInfo.uid > action.payload.uid
							? userInfo.uid + action.payload.uid
							: action.payload.uid + userInfo.uid,
				};
			default:
				return state;
		}
	};

	const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

	return (
		<ChatContext.Provider value={{ data: state, dispatch }}>
			{children}
		</ChatContext.Provider>
	);
};
