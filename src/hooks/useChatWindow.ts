
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export const useChatWindow = (chatId: string) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    chats, 
    users, 
    currentUser, 
    sendMessage, 
    sendTyping, 
    sendStopTyping, 
    onlineUsers, 
    typingUsers, 
    openOneToOneChat 
  } = useUser();

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
    
    if (otherUserId && e.target.value.trim()) {
      sendTyping(chatId, otherUserId);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const newTimeout = setTimeout(() => {
        sendStopTyping(chatId, otherUserId);
      }, 2000);
      
      setTypingTimeout(newTimeout);
    } else if (otherUserId && !e.target.value.trim()) {
      sendStopTyping(chatId, otherUserId);
    }
  };

  // Load initial messages
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

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    chat,
    otherUser,
    isOtherUserOnline,
    isOtherUserTyping,
    message,
    setMessage,
    loadingMessages,
    initialLoad,
    messagesEndRef,
    currentUser,
    users,
    loadMoreMessages,
    handleSendMessage,
    handleKeyPress,
    handleInputChange
  };
};
