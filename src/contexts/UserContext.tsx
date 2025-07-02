
import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { notificationService } from '@/services/notificationService';
import { User, Group, Chat, Message, UserContextType } from '@/types/user';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';
import { useUserActions } from '@/hooks/useUserActions';
import { useGroupActions } from '@/hooks/useGroupActions';
import { useChatActions } from '@/hooks/useChatActions';
import { useSearchActions } from '@/hooks/useSearchActions';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [trendingGroups, setTrendingGroups] = useState<Group[]>([]);
  const [newGroups, setNewGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);

  // Initialize hooks
  const userActions = useUserActions(currentUser, setCurrentUser, users, setUsers);
  const groupActions = useGroupActions(
    currentUser, 
    groups, 
    setGroups, 
    setTrendingGroups, 
    setNewGroups, 
    setPopularGroups
  );
  const chatActions = useChatActions(currentUser, chats, setChats, users, setUsers);
  const searchActions = useSearchActions(currentUser, users, groups);

  useEffect(() => {
    const savedData = loadFromStorage();
    setCurrentUser(savedData.currentUser);
    setUsers(savedData.users);
    setGroups(savedData.groups);
    setChats(savedData.chats);
  }, []);

  useEffect(() => {
    if (currentUser) {
      socketService.connect();
      setTimeout(() => {
        socketService.join(currentUser.id);
      }, 1000);

      socketService.onMessage((message) => {
        console.log('Received message in context:', message);
        
        const newMessage: Message = {
          id: message._id,
          senderId: message.sender,
          content: message.text,
          timestamp: new Date(message.createdAt),
          type: 'text'
        };

        // Find sender info for notifications
        const sender = users.find(u => u.id === message.sender);
        const senderName = sender?.name || sender?.username || 'Anonymous User';

        setChats(prev => {
          const chatId = message.type === 'private' 
            ? prev.find(c => 
                c.type === 'direct' && 
                c.participants.includes(currentUser.id) && 
                c.participants.includes(message.sender)
              )?.id
            : message.groupId;

          if (!chatId) {
            console.log('Chat not found for message:', message);
            return prev;
          }

          const updated = prev.map(chat => 
            chat.id === chatId
              ? { 
                  ...chat, 
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage,
                  updatedAt: new Date()
                }
              : chat
          );
          
          saveToStorage.chats(updated);
          
          // Show notification if user is not currently in this chat
          if (message.sender !== currentUser.id) {
            notificationService.showMessageNotification(
              senderName,
              message.text,
              currentChatUserId,
              message.sender
            );
          }
          
          return updated;
        });
      });

      socketService.onUserOnline((userId) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      socketService.onUserOffline((userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      socketService.onTyping((fromUserId) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(fromUserId, 'typing');
          return newMap;
        });
      });

      socketService.onStopTyping((fromUserId) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(fromUserId);
          return newMap;
        });
      });
    }

    return () => {
      if (!currentUser) {
        socketService.disconnect();
      }
    };
  }, [currentUser, users, currentChatUserId]);

  // Enhanced context value with current chat tracking
  const contextValue = {
    currentUser,
    users,
    groups,
    chats,
    loading: userActions.loading || groupActions.loading,
    onlineUsers,
    typingUsers,
    trendingGroups,
    newGroups,
    popularGroups,
    currentChatUserId,
    setCurrentChatUserId,
    ...userActions,
    ...groupActions,
    ...chatActions,
    ...searchActions
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
