
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, MessageSquare, Users, Clock } from 'lucide-react';

interface ChatListProps {
  onBack: () => void;
  onStartChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onBack, onStartChat }) => {
  const { currentUser, chats, groups, users, loadMyChats } = useUser();

  useEffect(() => {
    if (currentUser) {
      loadMyChats();
    }
  }, [currentUser, loadMyChats]);

  if (!currentUser) return null;

  const directChats = chats.filter(chat => chat.type === 'direct' || chat.type === 'random');
  const groupChats = chats.filter(chat => chat.type === 'group');

  const getChatDisplayName = (chat: any) => {
    if (chat.type === 'group') {
      const group = groups.find(g => g.id === chat.groupId);
      return group?.name || 'Group Chat';
    } else {
      const otherUserId = chat.participants.find((id: string) => id !== currentUser.id);
      const otherUser = users.find(u => u.id === otherUserId);
      return otherUser?.name || otherUser?.username || 'Anonymous User';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">My Chats</h1>
          </div>
        </div>

        {/* Direct Chats Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Direct Chats ({directChats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directChats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No direct chats yet. Start a conversation!</p>
            ) : (
              <div className="space-y-3">
                {directChats.map((chat) => {
                  const otherUserId = chat.participants.find(id => id !== currentUser.id);
                  const otherUser = users.find(u => u.id === otherUserId);
                  
                  return (
                    <div 
                      key={chat.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => onStartChat(chat.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {otherUser?.name?.charAt(0)?.toUpperCase() || otherUser?.username?.charAt(0)?.toUpperCase() || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {otherUser?.name || otherUser?.username || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Last active: {new Date(chat.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white">
                            {chat.unreadCount}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          Open
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Chats Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Group Chats ({groupChats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupChats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No group chats yet. Join a group to start chatting!</p>
            ) : (
              <div className="space-y-3">
                {groupChats.map((chat) => {
                  const group = groups.find(g => g.id === chat.groupId);
                  
                  return (
                    <div 
                      key={chat.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => onStartChat(chat.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {getChatDisplayName(chat).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getChatDisplayName(chat)}</p>
                          <p className="text-sm text-gray-500">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{chat.participants.length} members</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Open
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatList;
