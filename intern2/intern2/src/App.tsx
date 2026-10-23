import { useState, useRef, useEffect, useCallback } from 'react';
import { Headset, Send, Sparkles, Trash2 } from 'lucide-react';
import ChatMessage, { type Message } from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import QuickReplies from '@/components/QuickReplies';
import { findAnswer } from '@/lib/assistantEngine';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hi there! I'm your Support Assistant. Ask me anything about our hours, internship project submission, or certificate timelines.",
  timestamp: Date.now(),
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: uid(),
        sender: 'user',
        text: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      const result = findAnswer(trimmed);
      const delay = 700 + Math.random() * 600;

      setTimeout(() => {
        const botMsg: Message = {
          id: uid(),
          sender: 'assistant',
          text: result.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        inputRef.current?.focus();
      }, delay);
    },
    [isTyping]
  );

  const handleClear = () => {
    setMessages([{ ...WELCOME_MESSAGE, id: 'welcome', timestamp: Date.now() }]);
    setInput('');
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Headset className="h-5.5 w-5.5" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">Support Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs font-medium text-slate-500">Online · Typically replies instantly</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          title="Clear conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear chat</span>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick replies — only show when few messages and not typing */}
      {messages.length <= 1 && !isTyping && (
        <div className="mx-auto w-full max-w-2xl px-2">
          <div className="mb-1.5 flex items-center gap-1.5 px-2 text-xs font-medium text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            Suggested questions
          </div>
          <QuickReplies onSelect={sendMessage} />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200/70 bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-6"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-sm"
          >
            <Send className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-slate-400">
          This assistant provides answers based on common FAQs.
        </p>
      </form>
    </div>
  );
}
