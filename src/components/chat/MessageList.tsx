
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Chat, Message, User } from '@/types/user';

interface MessageListProps {
  chat: Chat;
  currentUser: User | null;
  users: User[];
  loadingMessages: boolean;
  onLoadMore: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isOtherUserTyping: boolean;
  otherUser?: User;
}

const MessageList: React.FC<MessageListProps> = ({
  chat,
  currentUser,
  users,
  loadingMessages,
  onLoadMore,
  messagesEndRef,
  isOtherUserTyping,
  otherUser
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Load More Button */}
      {chat.messages.length > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMessages}
          >
            {loadingMessages ? (
              <>
                <MoreHorizontal className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Load More Messages
              </>
            )}
          </Button>
        </div>
      )}

      {chat.messages.length === 0 && !loadingMessages ? (
        <div className="text-center text-gray-500 py-8">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        chat.messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?.id;
          const sender = users.find(u => u.id === msg.senderId);
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md`}>
                {!isOwn && (
                  <p className="text-xs text-gray-500 mb-1 px-3">
                    {sender?.name || sender?.username || 'Anonymous'}
                  </p>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <p className="text-xs text-gray-500 mb-1 px-3">
              {otherUser?.name || otherUser?.username || 'Anonymous'}
            </p>
            <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
              <p className="text-gray-500 italic">typing...</p>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
