import { Conversation, Message, User } from '@prisma/client';

export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

export type MessageCategory =
  | 'general'
  | 'code'
  | 'email'
  | 'task'
  | 'productivity';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  category?: MessageCategory;
  codeLanguage?: string;
}
