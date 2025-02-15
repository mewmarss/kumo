import { format } from 'date-fns';
import clsx from 'clsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { AIMessage, MessageCategory } from '@/app/types';
import { useState } from 'react';
import { BsCheck, BsCopy } from 'react-icons/bs';

interface AIMessageBubbleProps {
  message: AIMessage;
  isOwn: boolean;
}

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={clsx(
          'absolute right-2 top-2',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'p-1.5 rounded-md',
          'bg-gray-700/80 hover:bg-gray-600',
          'text-gray-200 hover:text-white',
          'flex items-center gap-1.5',
          'text-xs font-medium',
          'backdrop-blur-sm'
        )}
      >
        {copied ? (
          <>
            <BsCheck className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <BsCopy className="w-3.5 h-3.5" />
            <span>Copy code</span>
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={vscDarkPlus}
        className="rounded-md !my-0"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const AIMessageBubble = ({ message, isOwn }: AIMessageBubbleProps) => {
  const getCategoryColor = (category?: MessageCategory) => {
    switch (category) {
      case 'code':
        return 'border-blue-400';
      case 'email':
        return 'border-green-400';
      case 'task':
        return 'border-purple-400';
      case 'productivity':
        return 'border-orange-400';
      default:
        return 'border-transparent';
    }
  };

  const getCategoryIcon = (category?: MessageCategory) => {
    switch (category) {
      case 'code':
        return '💻';
      case 'email':
        return '📧';
      case 'task':
        return '📋';
      case 'productivity':
        return '⚡';
      default:
        return null;
    }
  };

  const isCodeBlock = message.content.startsWith('```');
  const codeContent = message.content
    .replace(/```\w*\n?/, '')
    .replace(/```$/, '');

  return (
    <div
      className={clsx(
        'flex gap-2 w-full',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'rounded-lg p-4',
          'border-l-4',
          getCategoryColor(message.category),
          isOwn ? 'bg-black text-white' : 'bg-gray-100 shadow-sm',
          'transition-all duration-200',
          'max-w-[85%]'
        )}
      >
        {message.category && (
          <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
            {getCategoryIcon(message.category)}
            <span className="capitalize">{message.category}</span>
          </div>
        )}

        <div
          className={clsx(
            'prose max-w-none',
            isOwn ? 'prose-invert' : 'prose-gray'
          )}
        >
          {isCodeBlock ? (
            <CodeBlock code={codeContent} language={message.codeLanguage} />
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="my-0">{children}</p>,
                ul: ({ children }) => <ul className="my-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-1">{children}</ol>,
                li: ({ children }) => <li className="my-0">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <div
          className={clsx(
            'text-xs mt-2',
            isOwn ? 'text-sky-200' : 'text-gray-400'
          )}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </div>
      </div>
    </div>
  );
};
