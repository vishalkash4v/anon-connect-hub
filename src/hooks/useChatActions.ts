import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import { User, Chat, Message } from '@/types/user';
import { saveToStorage } from '@/utils/localStorage';

export const useChatActions = (
  currentUser: User | null,
  chats: Chat[],
  setChats: (chats: Chat[]) => void,
  users: User[],
  setUsers: (users: User[]) => void
) => {
  const loadMyChats = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      const response = await apiService.getMyChats({ userId: currentUser.id });
      
      if (response.status && response.data) {
        const { groupChats, oneToOneChats } = response.data;
        const newChats: Chat[] = [];
        const newUsers: User[] = [...users];

        // Process group chats
        groupChats.forEach((groupChat: any) => {
          const chat: Chat = {
            id: groupChat._id,
            type: 'group',
            participants: groupChat.members,
            groupId: groupChat._id,
            messages: [],
            unreadCount: 0,
            updatedAt: new Date(groupChat.createdAt),
            lastMessage: groupChat.lastMessage ? {
              id: groupChat.lastMessage._id,
              senderId: groupChat.lastMessage.sender,
              content: groupChat.lastMessage.text,
              timestamp: new Date(groupChat.lastMessage.createdAt),
              type: 'text'
            } : undefined
          };
          newChats.push(chat);
        });

        // Process one-to-one chats
        oneToOneChats.forEach((oneToOneChat: any) => {
          if (oneToOneChat.user) {
            // Add user to users list if not already present
            const existingUser = newUsers.find(u => u.id === oneToOneChat.user._id);
            if (!existingUser) {
              const user: User = {
                id: oneToOneChat.user._id,
                name: oneToOneChat.user.name,
                phone: oneToOneChat.user.phone,
                email: oneToOneChat.user.email,
                username: oneToOneChat.user.username,
                isAnonymous: !oneToOneChat.user.name,
                lastSeen: new Date()
              };
              newUsers.push(user);
            }

            const chat: Chat = {
              id: oneToOneChat._id, // Use the actual chat _id from API
              type: 'direct',
              participants: [currentUser.id, oneToOneChat.user._id],
              messages: [],
              unreadCount: 0,
              updatedAt: new Date(oneToOneChat.lastMessage.createdAt),
              lastMessage: {
                id: oneToOneChat.lastMessage._id, // Use the actual message _id from API
                senderId: oneToOneChat.lastMessage.sender,
                content: oneToOneChat.lastMessage.text,
                timestamp: new Date(oneToOneChat.lastMessage.createdAt),
                type: 'text'
              }
            };
            newChats.push(chat);
          }
        });

        setChats(newChats);
        setUsers(newUsers);
        saveToStorage.chats(newChats);
        saveToStorage.users(newUsers);
      }
    } catch (error) {
      console.error('Error loading my chats:', error);
    }
  };

  const startDirectChat = (userId: string): string => {
    if (!currentUser) return '';

    const existingChat = chats.find(chat => 
      chat.type === 'direct' && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(userId)
    );

    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: `chat_${currentUser.id}_${userId}`,
      type: 'direct',
      participants: [currentUser.id, userId],
      messages: [],
      unreadCount: 0,
      updatedAt: new Date()
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    saveToStorage.chats(updatedChats);

    return newChat.id;
  };

  const startRandomChat = async (): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      const response = await apiService.openRandomChat({ userId: currentUser.id });
      
      if (response.status && response.data) {
        const { matchedUser } = response.data;
        
        // Add matched user to users list if not already present
        const existingUser = users.find(u => u.id === matchedUser._id);
        if (!existingUser) {
          const newUser: User = {
            id: matchedUser._id,
            name: matchedUser.name,
            phone: matchedUser.phone,
            email: matchedUser.email,
            username: matchedUser.username,
            isAnonymous: matchedUser.isAnonymous,
            lastSeen: new Date(matchedUser.createdAt),
            bio: matchedUser.bio,
            avatar: matchedUser.avatar
          };
          
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          saveToStorage.users(updatedUsers);
        }

        // Create or find existing chat
        const existingChat = chats.find(chat => 
          chat.type === 'random' && 
          chat.participants.includes(currentUser.id) && 
          chat.participants.includes(matchedUser._id)
        );

        if (existingChat) {
          return existingChat.id;
        }

        const newChat: Chat = {
          id: `random_${currentUser.id}_${matchedUser._id}`,
          type: 'random',
          participants: [currentUser.id, matchedUser._id],
          messages: [],
          unreadCount: 0,
          updatedAt: new Date()
        };

        const updatedChats = [...chats, newChat];
        setChats(updatedChats);
        saveToStorage.chats(updatedChats);

        return newChat.id;
      }
    } catch (error) {
      console.error('Error starting random chat:', error);
    }

    return null;
  };

  const openGroupChat = async (groupId: string, lastMessageId?: string, limit?: number): Promise<Message[]> => {
    try {
      const response = await apiService.openGroupChat({
        groupId,
        lastMessageId,
        limit: limit || 20
      });

      if (response.messages) {
        return response.messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          type: msg.type || 'text'
        }));
      }
    } catch (error) {
      console.error('Error opening group chat:', error);
    }

    const chat = chats.find(c => c.groupId === groupId);
    return chat?.messages || [];
  };

  const openOneToOneChat = async (chatId: string, lastMessageId?: string, limit?: number): Promise<Message[]> => {
    if (!currentUser) return [];

    try {
      console.log('Opening one-to-one chat with:', {
        chatId, // This should be the actual _id from my-chats API
        userId: currentUser.id,
        lastMessageId, // This should be the actual lastMessage._id from my-chats API
        limit: limit || 20
      });

      const response = await apiService.openOneToOneChat({
        chatId, // Using the actual chat _id
        userId: currentUser.id,
        lastMessageId, // Using the actual message _id
        limit: limit || 20
      });

      if (response.status && response.data && response.data.messages) {
        const messages = response.data.messages.map((msg: any) => ({
          id: msg._id,
          senderId: msg.sender._id,
          content: msg.text,
          timestamp: new Date(msg.createdAt),
          type: 'text'
        }));

        // Update the chat with loaded messages
        const updatedChats = chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: lastMessageId ? [...messages, ...chat.messages] : messages
            };
          }
          return chat;
        });
        setChats(updatedChats);
        saveToStorage.chats(updatedChats);

        return messages;
      }
    } catch (error) {
      console.error('Error opening one-to-one chat:', error);
    }

    const chat = chats.find(c => c.id === chatId);
    return chat?.messages || [];
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type: 'text'
    };

    if (chat.type === 'direct' || chat.type === 'random') {
      const otherUserId = chat.participants.find(id => id !== currentUser.id);
      if (otherUserId) {
        socketService.sendMessage({
          fromUserId: currentUser.id,
          toUserId: otherUserId,
          message: content,
          type: 'private'
        });
      }
    } else if (chat.type === 'group' && chat.groupId) {
      socketService.sendMessage({
        fromUserId: currentUser.id,
        groupId: chat.groupId,
        message: content,
        type: 'group'
      });
    }

    const updatedChats = chats.map(c => 
      c.id === chatId
        ? { 
            ...c, 
            messages: [...c.messages, newMessage],
            lastMessage: newMessage,
            updatedAt: new Date()
          }
        : c
    );
    setChats(updatedChats);
    saveToStorage.chats(updatedChats);
  };

  const sendTyping = (chatId: string, otherUserId: string) => {
    if (!currentUser) return;
    
    socketService.sendTyping({
      fromUserId: currentUser.id,
      toUserId: otherUserId
    });
  };

  const sendStopTyping = (chatId: string, otherUserId: string) => {
    if (!currentUser) return;
    
    socketService.sendStopTyping({
      fromUserId: currentUser.id,
      toUserId: otherUserId
    });
  };

  return {
    loadMyChats,
    startDirectChat,
    startRandomChat,
    openGroupChat,
    openOneToOneChat,
    sendMessage,
    sendTyping,
    sendStopTyping
  };
};
