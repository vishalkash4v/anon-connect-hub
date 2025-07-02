
import React from 'react';
import { useChatWindow } from '@/hooks/useChatWindow';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatLoadingState from './chat/ChatLoadingState';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const {
    chat,
    otherUser,
    isOtherUserOnline,
    isOtherUserTyping,
    message,
    loadingMessages,
    initialLoad,
    messagesEndRef,
    currentUser,
    users,
    loadMoreMessages,
    handleSendMessage,
    handleKeyPress,
    handleInputChange
  } = useChatWindow(chatId);

  // Show loading state for initial load
  if (initialLoad && loadingMessages) {
    return (
      <ChatLoadingState 
        otherUser={otherUser} 
        onBack={onBack} 
      />
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chat not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader
        otherUser={otherUser}
        isOtherUserOnline={isOtherUserOnline}
        onBack={onBack}
      />

      <MessageList
        chat={chat}
        currentUser={currentUser}
        users={users}
        loadingMessages={loadingMessages}
        onLoadMore={loadMoreMessages}
        messagesEndRef={messagesEndRef}
        isOtherUserTyping={isOtherUserTyping}
        otherUser={otherUser}
      />

      <MessageInput
        message={message}
        onMessageChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatWindow;
