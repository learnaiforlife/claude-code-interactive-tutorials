export type Track = 'beginner' | 'intermediate' | 'advanced';
export type TipKind = 'signature' | 'inline';

export interface Tip {
  id: string;          // unique, e.g. 'l3-grep'
  title: string;       // short imperative
  detail: string;      // one-line "why it saves"
  kind: TipKind;
  savedTokens: number; // illustrative per-use estimate; methodology in Phase 2
}

export interface Lesson {
  slug: string;
  order: number;
  track: Track;
  title: string;
  estimatedMinutes: number;
  format: string;
  context: string;     // 1–3 sentences, no padding
  tips: Tip[];         // exactly 3, exactly one 'signature'
}

export interface Progress {
  bankedTips: Record<string, string[]>; // lessonSlug -> tipId[]
}
