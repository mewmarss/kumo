'use client';

import { useForm, FieldValues } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useAIChat } from '../hooks/useAIChat';
import MessageInput from '../conversations/[conversationId]/components/MessageInput';
import { AIMessageBubble } from './components/AIMessageBubble';
import { MdDelete, MdArrowBack } from 'react-icons/md';
import { useEffect, useRef } from 'react';

export default function AIChat() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const router = useRouter();
  const { messages, isLoading, sendMessage, clearHistory } = useAIChat();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (data: FieldValues) => {
    if (data.message.trim()) {
      await sendMessage(data.message);
      reset();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 sm:p-6 border-b bg-white/95 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition block md:hidden"
          >
            <MdArrowBack className="text-xl text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
              <span className="font-bold text-orange-500">Kumo</span> AI
              Assistant
            </h2>
            <p className="text-sm text-gray-500 mt-1 sm:block hidden">
              {session?.user?.name ? (
                <>
                  Welcome back,{' '}
                  <strong className="font-bold text-gray-700">
                    {session.user.name}
                  </strong>
                  ! How can I help you today?
                </>
              ) : (
                'Your professional coding and productivity companion'
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1 sm:hidden">
              {session?.user?.name && `Welcome ${session.user.name}`}
            </p>
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={clearHistory}
          className="hidden sm:flex items-center gap-2 bg-gray-100 text-rose-500 font-semibold px-4 py-2 rounded-md hover:bg-rose-500 hover:text-white transition"
        >
          <MdDelete className="text-lg" />
          Clear Chat
        </button>
        <button
          onClick={clearHistory}
          className="sm:hidden p-2 rounded-full bg-gray-100 text-rose-500 hover:bg-rose-500 hover:text-white transition"
        >
          <MdDelete className="text-lg" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <AIMessageBubble
              key={message.id}
              message={message}
              isOwn={message.role === 'user'}
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex gap-2 items-center text-gray-500">
            <div className="animate-bounce font-bold">⋯</div>
            <span className="text-base">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Field */}
      <div className="p-6 border-t bg-white/95">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <div className="flex-1">
            <MessageInput
              id="message"
              register={register}
              errors={errors}
              required
              placeholder="Message Kumo AI..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full p-3 bg-orange-500 cursor-pointer hover:bg-orange-600 transition disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2 12l8-8v5h12v6H10v5z"
                transform="rotate(90 12 12)"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
