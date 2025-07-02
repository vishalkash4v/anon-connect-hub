
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Send, MoreHorizontal } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chats, users, currentUser, sendMessage, sendTyping, sendStopTyping, onlineUsers, typingUsers, openOneToOneChat } = useUser();

  const chat = chats.find(c => c.id === chatId);
  const otherUserId = chat?.participants.find(id => id !== currentUser?.id);
  const otherUser = users.find(u => u.id === otherUserId);
  const isOtherUserOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;
  const isOtherUserTyping = otherUserId ? typingUsers.has(otherUserId) : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Load messages when chat opens
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (chat && initialLoad) {
        setInitialLoad(false);
        setLoadingMessages(true);
        
        try {
          console.log('Loading initial messages for chat:', chatId);
          await openOneToOneChat(chatId, undefined, 20);
        } catch (error) {
          console.error('Error loading initial messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      }
    };

    loadInitialMessages();
  }, [chat?.id, initialLoad]);

  const loadMessages = async (lastMessageId?: string) => {
    if (!chat || loadingMessages) return;

    setLoadingMessages(true);
    try {
      if (chat.type === 'direct' || chat.type === 'random') {
        console.log('Loading more messages with lastMessageId:', lastMessageId);
        await openOneToOneChat(chatId, lastMessageId, 20);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMoreMessages = () => {
    if (chat && chat.messages.length > 0) {
      const oldestMessage = chat.messages[0];
      console.log('Loading more messages, oldest message ID:', oldestMessage.id);
      loadMessages(oldestMessage.id);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(chatId, message.trim());
      setMessage('');
      
      // Stop typing when message is sent
      if (otherUserId) {
        sendStopTyping(chatId, otherUserId);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    if (otherUserId && e.target.value.trim()) {
      sendTyping(chatId, otherUserId);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      const newTimeout = setTimeout(() => {
        sendStopTyping(chatId, otherUserId);
      }, 2000);
      
      setTypingTimeout(newTimeout);
    } else if (otherUserId && !e.target.value.trim()) {
      sendStopTyping(chatId, otherUserId);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Show loading state for initial load
  if (initialLoad && loadingMessages) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Avatar>
                <AvatarFallback>
                  {otherUser?.name?.charAt(0)?.toUpperCase() || otherUser?.username?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="font-semibold">
                {otherUser?.name || otherUser?.username || 'Anonymous User'}
              </h2>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>

        {/* Loading Messages */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      </div>
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
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Avatar>
              <AvatarFallback>
                {otherUser?.name?.charAt(0)?.toUpperCase() || otherUser?.username?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            {isOtherUserOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {otherUser?.name || otherUser?.username || 'Anonymous User'}
            </h2>
            <p className="text-sm text-gray-500">
              {isOtherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load More Button */}
        {chat.messages.length > 0 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
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

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
