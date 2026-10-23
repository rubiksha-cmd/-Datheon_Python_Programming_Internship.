import { faqDataset, type FAQ } from './faqData';

export interface MatchResult {
  reply: string;
  matchedFAQ: FAQ | null;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function isGreeting(text: string): boolean {
  const normalized = normalize(text);
  return faqDataset.greetings.some((g) => normalized === g || normalized.startsWith(`${g} `));
}

function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreFAQ(faq: FAQ, tokens: string[]): number {
  const normalizedQuestion = faq.question.toLowerCase();
  let score = 0;

  for (const keyword of faq.keywords) {
    if (normalizedQuestion.includes(keyword)) {
      score += 0.5;
    }
    for (const token of tokens) {
      if (keyword.includes(token) || token.includes(keyword)) {
        score += 1;
      }
    }
  }

  // Direct question similarity
  for (const token of tokens) {
    if (normalizedQuestion.includes(token)) {
      score += 0.3;
    }
  }

  return score;
}

export function findAnswer(userMessage: string): MatchResult {
  const text = userMessage.trim();

  if (!text) {
    return { reply: 'Please type a message so I can help you.', matchedFAQ: null };
  }

  if (isGreeting(text)) {
    return {
      reply: "Hello! I'm your support assistant. How can I help you today? You can ask me about our hours, project submission, or certificates.",
      matchedFAQ: null,
    };
  }

  const tokens = tokenize(text);
  let bestFAQ: FAQ | null = null;
  let bestScore = 0;

  for (const faq of faqDataset.faqs) {
    const score = scoreFAQ(faq, tokens);
    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  if (bestFAQ && bestScore > 0) {
    return { reply: bestFAQ.answer, matchedFAQ: bestFAQ };
  }

  return {
    reply: "I'm sorry, I couldn't find an exact answer for that. Try asking about our operating hours, internship project submission, or certificate timelines.",
    matchedFAQ: null,
  };
}
