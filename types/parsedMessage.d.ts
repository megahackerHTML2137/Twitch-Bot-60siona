export interface ParsedTwitchMessage {
  tags: TwitchParsedTags;
  source: TwitchParsedSource;
  command: TwitchParsedCommand;
  message: string;
}

// Command
interface TwitchCommand {
  type: string;
  botCommand?: string;
  botCommandParams?: string;
  channel?: string;
  isCapRequestEnabled?: boolean;
}

export type TwitchParsedCommand = TwitchCommand | null;

// Tags
export type TwitchParsedTags = Record<string, unknown>;

export type BadgeObjectsDictionary = { [key: string]: string };

// Emotes
export type EmotesObjectsDictionary = { [key: string]: EmotesPositionList[] };
export type EmotesPositionList = { startPosition: string; endPosition: string };
export type EmotesID = string[];

// Source
export type TwitchParsedSource = { nick: string | null; host: string } | null;
