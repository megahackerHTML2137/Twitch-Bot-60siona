export type DataForTranslator = Record<string, string>;

// Answer
export interface AnswerType {
  type: string;
  channel?: string;
  message: string;
  nick?: string;
}

export type BotAnswer = AnswerType | null;
