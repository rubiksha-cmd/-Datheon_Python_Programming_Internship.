import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-[fadeInUp_0.3s_ease-out]">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
        <Bot className="h-4.5 w-4.5" strokeWidth={2.2} />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-[bounce_1.2s_infinite] rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-[bounce_1.2s_infinite] rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-[bounce_1.2s_infinite] rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
