import { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { AIMessage, MessageCategory } from '../types';

const STORAGE_KEY = 'kumo_ai_chat_history';
const MAX_CONTEXT_MESSAGES = 10;

export const useAIChat = () => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  const clearHistory = useCallback(() => {
    if (session?.user?.email) {
      localStorage.removeItem(`${STORAGE_KEY}_${session.user.email}`);
      setMessages([]);
    }
  }, [session?.user?.email]);

  // Update activity time on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setLastActivityTime(Date.now());
    }
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.email &&
      messages.length > 0
    ) {
      localStorage.setItem(
        `${STORAGE_KEY}_${session.user.email}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, session?.user?.email, status]);

  const detectMessageCategory = (content: string): MessageCategory => {
    if (content.includes('```')) return 'code';
    if (content.toLowerCase().includes('email') || content.includes('@'))
      return 'email';
    if (content.toLowerCase().includes('task') || content.includes('todo'))
      return 'task';
    if (
      content.toLowerCase().includes('schedule') ||
      content.toLowerCase().includes('meeting')
    )
      return 'productivity';
    return 'general';
  };

  const detectCodeLanguage = (content: string): string | undefined => {
    const match = content.match(/```(\w+)/);
    return match ? match[1] : undefined;
  };

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      const category = detectMessageCategory(content);
      const newUserMessage: AIMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now(),
        category,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      // Get recent context
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = generatePrompt(content, recentMessages);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      const aiCategory = detectMessageCategory(aiResponse);
      const codeLanguage = detectCodeLanguage(aiResponse);

      const newAIMessage: AIMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        category: aiCategory,
        codeLanguage,
      };

      setMessages((prev) => [...prev, newAIMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
          category: 'general',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrompt = (userInput: string, context: AIMessage[]) => {
    return `You are Kumo AI, a professional assistant integrated into the Kumo chat application. Your primary focus areas are:

1. Code Assistance:
   - Debugging and code review
   - Best practices and patterns
   - Framework-specific guidance (Next.js, React, etc.)
   - Performance optimization

2. Productivity:
   - Task management and prioritization
   - Meeting scheduling and agenda planning
   - Project timeline estimation
   - Team collaboration workflows

3. Professional Communication:
   - Email drafting and review
   - Technical documentation
   - Client communication
   - Team updates

4. Development Workflow:
   - Git operations and best practices
   - CI/CD pipeline suggestions
   - Testing strategies
   - Development environment setup

Previous conversation context:
${context.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

Current user query: ${userInput}

Provide a clear, concise, and professional response focusing on actionable insights and practical solutions.`;
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  };
};
