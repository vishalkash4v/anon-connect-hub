
export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  username?: string;
  isAnonymous: boolean;
  lastSeen: Date;
  bio?: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPrivate?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'random';
  participants: string[];
  groupId?: string;
  messages: Message[];
  unreadCount: number;
  updatedAt: Date;
  lastMessage?: Message;
}

export interface UserContextType {
  // User state
  currentUser: User | null;
  users: User[];
  
  // Group state
  groups: Group[];
  
  // Chat state
  chats: Chat[];
  
  // UI state
  loading: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, string>;
  
  // Group categories
  trendingGroups: Group[];
  newGroups: Group[];
  popularGroups: Group[];
  
  // Current chat tracking for notifications
  currentChatUserId: string | null;
  setCurrentChatUserId: (userId: string | null) => void;
  
  // User actions
  registerUser: (userData: Partial<User>) => Promise<void>;
  loginUser: (userData: { phone?: string; email?: string; password?: string }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  
  // Group actions
  createGroup: (groupData: { name: string; description?: string; isPrivate?: boolean }) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  loadGroupsOverview: () => Promise<void>;
  
  // Chat actions
  loadMyChats: () => Promise<void>;
  startDirectChat: (userId: string) => string;
  startRandomChat: () => Promise<string | null>;
  openGroupChat: (groupId: string, lastMessageId?: string, limit?: number) => Promise<Message[]>;
  openOneToOneChat: (chatId: string, lastMessageId?: string, limit?: number) => Promise<Message[]>;
  sendMessage: (chatId: string, content: string) => void;
  sendTyping: (chatId: string, otherUserId: string) => void;
  sendStopTyping: (chatId: string, otherUserId: string) => void;
  
  // Search actions
  searchUsers: (query: string) => Promise<User[]>;
  searchGroups: (query: string) => Promise<Group[]>;
  globalSearch: (query: string) => Promise<any[]>;
}
