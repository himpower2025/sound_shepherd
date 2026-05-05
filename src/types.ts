export interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: GuideContent[];
}

export interface GuideContent {
  title: string;
  text: string;
  tips?: string[];
  type?: 'text' | 'list' | 'image' | 'warning';
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export type AppState = 'home' | 'guide' | 'glossary' | 'assistant' | 'mixer' | 'recorder' | 'frequency';
