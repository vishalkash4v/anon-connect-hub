
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  message: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  onMessageChange,
  onKeyPress,
  onSendMessage
}) => {
  return (
    <div className="bg-white border-t p-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={onMessageChange}
          onKeyPress={onKeyPress}
          className="flex-1"
        />
        <Button onClick={onSendMessage} disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
