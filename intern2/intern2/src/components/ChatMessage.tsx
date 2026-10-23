import { Bot, User } from 'lucide-react';

export type Sender = 'user' | 'assistant';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-end gap-2.5 animate-[fadeInUp_0.3s_ease-out] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
        }`}
      >
        {isUser ? <User className="h-4.5 w-4.5" strokeWidth={2.2} /> : <Bot className="h-4.5 w-4.5" strokeWidth={2.2} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white'
              : 'rounded-bl-md bg-white text-slate-700 border border-slate-200/80'
          }`}
        >
          {message.text}
        </div>
        <span className="px-1 text-[11px] font-medium text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
