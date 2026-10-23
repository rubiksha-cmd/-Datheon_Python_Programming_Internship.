import { faqDataset } from '@/lib/faqData';
import { MessageSquare } from 'lucide-react';

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {faqDataset.faqs.map((faq) => (
        <button
          key={faq.question}
          onClick={() => onSelect(faq.question)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
        >
          <MessageSquare className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-emerald-500" />
          {faq.question}
        </button>
      ))}
    </div>
  );
}
