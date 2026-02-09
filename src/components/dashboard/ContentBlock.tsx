'use client';

import type { ContentBlock as ContentBlockType, ChecklistItem } from '@/types';
import Checklist from './Checklist';
import PromptCard from './PromptCard';
import InfoCard from './InfoCard';
import PlaceholderCard from './PlaceholderCard';

interface ContentBlockProps {
  block: ContentBlockType;
}

export default function ContentBlock({ block }: ContentBlockProps) {
  switch (block.type) {
    case 'checklist':
      return (
        <Checklist
          title={block.title}
          checklistId={block.id}
          items={block.content as ChecklistItem[]}
        />
      );
    case 'prompt':
      return (
        <PromptCard
          title={block.title}
          content={block.content as string}
        />
      );
    case 'info':
      return (
        <InfoCard
          title={block.title}
          content={block.content as string}
        />
      );
    case 'placeholder':
      return (
        <PlaceholderCard
          title={block.title}
          content={block.content as string}
        />
      );
    default:
      return null;
  }
}
