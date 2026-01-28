// Profile types for Divorce Companion

export type RelationshipType =
  | 'married'
  | 'international_marriage'
  | 'common_law'
  | 'divorced';

export type Stage =
  | 'thinking'
  | 'separated'
  | 'in_court'
  | 'post_divorce';

export type Priority =
  | 'children'
  | 'finances'
  | 'housing'
  | 'emotional_support'
  | 'legal_admin';

export interface Profile {
  id: string;
  email: string;
  country: string | null;
  relationship_type: RelationshipType | null;
  stage: Stage | null;
  priorities: Priority[];
  has_children: boolean | null;
  children_count: number | null;
  children_ages: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Onboarding state type
export interface OnboardingData {
  country: string;
  relationship_type: RelationshipType;
  stage: Stage;
  priorities: Priority[];
  has_children: boolean;
  children_count: number | null;
  children_ages: string | null;
}

// Dashboard content block types
export type ContentBlockType = 'checklist' | 'prompt' | 'info' | 'placeholder';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean; // Local state only, not persisted
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  title: string;
  content: string | ChecklistItem[];
}
