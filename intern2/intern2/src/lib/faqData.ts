export interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

export interface FAQDataset {
  greetings: string[];
  faqs: FAQ[];
}

export const faqDataset: FAQDataset = {
  greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
  faqs: [
    {
      question: 'What are your hours of operation?',
      answer: 'We operate Monday through Friday from 9:00 AM to 6:00 PM IST.',
      keywords: ['hours', 'operation', 'open', 'time', 'timing', 'schedule', 'when', 'working'],
    },
    {
      question: 'How do I submit my internship project?',
      answer: 'You can submit your public GitHub repository link through your Student Workspace.',
      keywords: ['submit', 'internship', 'project', 'github', 'repository', 'repo', 'workspace', 'upload'],
    },
    {
      question: 'When will I receive my certificate?',
      answer: 'Certificates are reviewed and issued within 3-5 business days after your code review.',
      keywords: ['certificate', 'receive', 'issue', 'reviewed', 'code review', 'days', 'get', 'when'],
    },
  ],
};
