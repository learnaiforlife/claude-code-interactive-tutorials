export type Track = 'beginner' | 'feature-modules' | 'power-user' | 'team';
export type TipKind = 'signature' | 'inline';

export interface TrackInfo {
  id: Track;
  title: string;
  description: string;
}

export interface Tip {
  id: string;          // unique, e.g. 'l3-grep'
  title: string;       // short imperative
  detail: string;      // one-line "why it saves"
  kind: TipKind;
  savedTokens: number; // illustrative per-use estimate; methodology in Phase 2
}

/** One line in a scripted Claude Code session (the animated terminal). */
export type SessionLineKind =
  | 'prompt'   // what the user types to Claude (typewriter, green ›)
  | 'reply'    // Claude's text response
  | 'thinking' // a "working" beat
  | 'tool'     // a tool action (Read, grep, dispatch subagent, …)
  | 'out'      // command / tool output
  | 'good'     // success line
  | 'warn'     // the wasteful cost being called out
  | 'rule'     // a divider label, e.g. "— the efficient way —"
  | 'impact';  // tokens-saved beat

export interface SessionLine {
  kind: SessionLineKind;
  text?: string;        // omitted only for some 'thinking' beats
  savedTokens?: number; // 'impact' only
  note?: string;        // 'impact' only
}

export interface TerminalChallenge {
  intro: string;
  prompt: string;
  accepted: string[];
  hint: string;
  incorrect: string;
  success: SessionLine[];
}

export interface LessonCheck {
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
    explanation: string;
  }>;
}

export interface DocsReference {
  title: string;
  href: string;
}

export interface Lesson {
  slug: string;
  order: number;
  track: Track;
  title: string;
  estimatedMinutes: number;
  format: string;
  featureFamily: string;      // curriculum family from the feature-module plan
  docsRefs: DocsReference[];  // official Claude Code docs backing this module
  efficiencyHabit: string;    // explicit token-saving behavior taught by the module
  context: string;        // 1–2 sentence lead-in
  concept: string;        // the core teaching, a few sentences
  session: SessionLine[]; // the animated Claude Code session for this lesson
  challenge?: TerminalChallenge; // optional type-it-yourself exercise
  check: LessonCheck;     // low-stakes checkpoint with explain-on-wrong
  tips: Tip[];            // exactly 3, exactly one 'signature'
}

export interface Progress {
  bankedTips: Record<string, string[]>; // lessonSlug -> tipId[]
}
