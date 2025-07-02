
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { User } from '@/types/user';

interface ChatHeaderProps {
  otherUser?: User;
  isOtherUserOnline: boolean;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  otherUser, 
  isOtherUserOnline, 
  onBack 
}) => {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar>
            <AvatarFallback>
              {otherUser?.name?.charAt(0)?.toUpperCase() || 
               otherUser?.username?.charAt(0)?.toUpperCase() || 'A'}
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
  );
};

export default ChatHeader;
