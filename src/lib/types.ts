export type Track = 'beginner' | 'intermediate' | 'advanced';
export type TipKind = 'signature' | 'inline';

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

export interface Lesson {
  slug: string;
  order: number;
  track: Track;
  title: string;
  estimatedMinutes: number;
  format: string;
  context: string;        // 1–2 sentence lead-in
  concept: string;        // the core teaching, a few sentences
  session: SessionLine[]; // the animated Claude Code session for this lesson
  tips: Tip[];            // exactly 3, exactly one 'signature'
}

export interface Progress {
  bankedTips: Record<string, string[]>; // lessonSlug -> tipId[]
}
