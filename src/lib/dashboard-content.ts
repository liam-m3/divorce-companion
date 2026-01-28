import type { ContentBlock, Stage, Priority } from '@/types';

// Stage-based content blocks
const STAGE_CONTENT: Record<Stage, ContentBlock[]> = {
  thinking: [
    {
      id: 'thinking-checklist',
      type: 'checklist',
      title: 'Things to Consider',
      content: [
        { id: 'tc-1', text: 'Review your financial situation', completed: false },
        { id: 'tc-2', text: 'Speak to a counsellor or therapist', completed: false },
        { id: 'tc-3', text: 'Gather important documents', completed: false },
        { id: 'tc-4', text: 'Research your options', completed: false },
      ],
    },
    {
      id: 'thinking-prompt',
      type: 'prompt',
      title: 'Reflection',
      content: 'Take time to consider what matters most to you and your family. There is no rush to make decisions.',
    },
  ],
  separated: [
    {
      id: 'separated-checklist',
      type: 'checklist',
      title: 'Immediate Admin Tasks',
      content: [
        { id: 'sa-1', text: 'Secure important documents', completed: false },
        { id: 'sa-2', text: 'Open a separate bank account', completed: false },
        { id: 'sa-3', text: 'Update emergency contacts', completed: false },
        { id: 'sa-4', text: 'Review shared accounts and subscriptions', completed: false },
      ],
    },
    {
      id: 'separated-prompt',
      type: 'prompt',
      title: 'Daily Check-in',
      content: 'How are you feeling today? Take a moment to acknowledge your emotions without judgement.',
    },
  ],
  in_court: [
    {
      id: 'court-checklist',
      type: 'checklist',
      title: 'Court Preparation',
      content: [
        { id: 'cp-1', text: 'Organise all relevant documents', completed: false },
        { id: 'cp-2', text: 'Keep records of all communications', completed: false },
        { id: 'cp-3', text: 'Note important deadlines', completed: false },
        { id: 'cp-4', text: 'Prepare questions for your solicitor', completed: false },
      ],
    },
    {
      id: 'court-info',
      type: 'info',
      title: 'Stay Organised',
      content: 'Keep all correspondence, financial documents, and legal papers in one secure location. Create a timeline of important events.',
    },
  ],
  post_divorce: [
    {
      id: 'post-checklist',
      type: 'checklist',
      title: 'Moving Forward',
      content: [
        { id: 'mf-1', text: 'Update legal documents (will, insurance)', completed: false },
        { id: 'mf-2', text: 'Update name if applicable', completed: false },
        { id: 'mf-3', text: 'Review beneficiaries on accounts', completed: false },
        { id: 'mf-4', text: 'Set new personal goals', completed: false },
      ],
    },
    {
      id: 'post-prompt',
      type: 'prompt',
      title: 'New Chapter',
      content: 'This is an opportunity for a fresh start. What do you want this next chapter of your life to look like?',
    },
  ],
};

// Priority-based content blocks
const PRIORITY_CONTENT: Record<Priority, ContentBlock[]> = {
  children: [
    {
      id: 'children-checklist',
      type: 'checklist',
      title: 'Children & Parenting',
      content: [
        { id: 'ch-1', text: 'Maintain consistent routines', completed: false },
        { id: 'ch-2', text: 'Keep communication with co-parent respectful', completed: false },
        { id: 'ch-3', text: 'Consider counselling for children', completed: false },
        { id: 'ch-4', text: 'Document parenting arrangements', completed: false },
      ],
    },
    {
      id: 'children-info',
      type: 'info',
      title: 'Supporting Your Children',
      content: 'Children need reassurance that both parents love them. Avoid speaking negatively about your co-parent in front of them.',
    },
  ],
  finances: [
    {
      id: 'finances-checklist',
      type: 'checklist',
      title: 'Financial Organisation',
      content: [
        { id: 'fi-1', text: 'List all assets and debts', completed: false },
        { id: 'fi-2', text: 'Gather financial statements', completed: false },
        { id: 'fi-3', text: 'Create a personal budget', completed: false },
        { id: 'fi-4', text: 'Check your credit score', completed: false },
      ],
    },
    {
      id: 'finances-placeholder',
      type: 'placeholder',
      title: 'Expense Tracker',
      content: 'Coming in a future update',
    },
  ],
  housing: [
    {
      id: 'housing-checklist',
      type: 'checklist',
      title: 'Housing Considerations',
      content: [
        { id: 'ho-1', text: 'Review your housing options', completed: false },
        { id: 'ho-2', text: 'Understand your rights', completed: false },
        { id: 'ho-3', text: 'Research rental properties if needed', completed: false },
        { id: 'ho-4', text: 'Update your address where necessary', completed: false },
      ],
    },
  ],
  emotional_support: [
    {
      id: 'emotional-checklist',
      type: 'checklist',
      title: 'Self-Care',
      content: [
        { id: 'es-1', text: 'Reach out to your support network', completed: false },
        { id: 'es-2', text: 'Consider professional help', completed: false },
        { id: 'es-3', text: 'Maintain physical health', completed: false },
        { id: 'es-4', text: 'Allow yourself to grieve', completed: false },
      ],
    },
    {
      id: 'emotional-prompt',
      type: 'prompt',
      title: 'Daily Gratitude',
      content: 'Name three things you are grateful for today, no matter how small.',
    },
  ],
  legal_admin: [
    {
      id: 'legal-checklist',
      type: 'checklist',
      title: 'Legal & Admin Tasks',
      content: [
        { id: 'la-1', text: 'Research solicitors in your area', completed: false },
        { id: 'la-2', text: 'Gather marriage certificate and documents', completed: false },
        { id: 'la-3', text: 'Understand the legal timeline', completed: false },
        { id: 'la-4', text: 'Keep copies of all correspondence', completed: false },
      ],
    },
  ],
};

// Function to get content blocks based on user's stage and priorities
export function getContentBlocksForUser(
  stage: Stage | null,
  priorities: Priority[]
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Add stage-based content
  if (stage && STAGE_CONTENT[stage]) {
    blocks.push(...STAGE_CONTENT[stage]);
  }

  // Add priority-based content
  for (const priority of priorities) {
    if (PRIORITY_CONTENT[priority]) {
      blocks.push(...PRIORITY_CONTENT[priority]);
    }
  }

  return blocks;
}

// Welcome messages based on stage
export const STAGE_WELCOME_MESSAGES: Record<Stage, string> = {
  thinking: "You're considering your options. Take the time you need.",
  separated: "You've taken a big step. Focus on getting organised.",
  in_court: "The legal process can be challenging. Stay focused and organised.",
  post_divorce: "A new chapter begins. Focus on rebuilding and moving forward.",
};
