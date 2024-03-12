export type DataForTranslator = Record<string, string>;

// Answer
export interface AnswerType {
  type: string;
  channel?: string;
  message: string;
}

export type BotAnswer = AnswerType | null;
