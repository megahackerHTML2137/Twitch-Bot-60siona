export interface ParsedTwitchMessage {
  tags: TwitchParsedTags | null;
  source: TwitchParsedSource | null;
  command: TwitchParsedCommand | null;
  message: string | null;
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
export type TwitchParsedTags = {
  [key: string]: BadgeObjectsDictionary | EmotesObjectsDictionary | EmotesID | string | null;
};

export type BadgeObjectsDictionary = { [key: string]: string };

// Emotes
export type EmotesObjectsDictionary = { [key: string]: EmotesPositionList[] };
export type EmotesPositionList = { startPosition: string; endPosition: string };
export type EmotesID = string[];

// Source
export type TwitchParsedSource = { nick: string | null; host: string } | null;
