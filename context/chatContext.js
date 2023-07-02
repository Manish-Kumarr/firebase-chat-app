import { createContext, useContext, useReducer, useState } from 'react';
import { useAuth } from './authContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [attachement, setAttachement] = useState(null);
  const [attachementPreview, setAttachementPreview] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [isTyping, setIsTyping] = useState(null);
  const [imageViewer, setImageViewer] = useState(null);

  const resetFooterStates = () => {
    setInputText('');
    setAttachement(null);
    setAttachementPreview(null);
    setEditMsg(null);
    setImageViewer(null);
  };

  const INITIAL_STATE = {
    chatId: '',
    user: null,
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case 'CHANGE_USER':
        return {
          user: action.payload,
          chatId:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
        };
      case 'EMPTY':
        return INITIAL_STATE;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider
      value={{
        users,
        setUsers,
        data: state,
        dispatch,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        inputText,
        setInputText,
        attachement,
        setAttachement,
        attachementPreview,
        setAttachementPreview,
        editMsg,
        setEditMsg,
        isTyping,
        setIsTyping,
        imageViewer,
        setImageViewer,
        resetFooterStates,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
