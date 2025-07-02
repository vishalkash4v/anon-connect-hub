
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { User } from '@/types/user';

interface ChatLoadingStateProps {
  otherUser?: User;
  onBack: () => void;
}

const ChatLoadingState: React.FC<ChatLoadingStateProps> = ({ 
  otherUser, 
  onBack 
}) => {
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
                {otherUser?.name?.charAt(0)?.toUpperCase() || 
                 otherUser?.username?.charAt(0)?.toUpperCase() || 'A'}
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
};

export default ChatLoadingState;
