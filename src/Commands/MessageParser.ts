// Types
import type {
  ParsedTwitchMessage,
  TwitchParsedCommand,
  TwitchParsedTags,
  BadgeObjectsDictionary,
  EmotesObjectsDictionary,
  EmotesPositionList,
  EmotesID,
  TwitchParsedSource,
} from '../../types/parsedMessage';

export default function parseMessage(rawMessage: string): ParsedTwitchMessage | null {
  let parsedMessage: ParsedTwitchMessage = {
    tags: null,
    source: null,
    command: null,
    message: null,
  };

  let rawTags = null;
  let rawSource = null;
  let rawCommand = null;
  let rawParameters = '';

  let index = 0;

  if (rawMessage[index] === '@') {
    let endIndex = rawMessage.indexOf(' ');
    rawTags = rawMessage.slice(1, endIndex);
    index = endIndex + 1;
  }

  if (rawMessage[index] === ':') {
    index++;
    let endIndex = rawMessage.indexOf(' ', index);
    rawSource = rawMessage.slice(index, endIndex);
    index = endIndex + 1;
  }

  let endIndex = rawMessage.indexOf(':', index);
  if (endIndex === -1) {
    endIndex = rawMessage.length;
  }

  rawCommand = rawMessage.slice(index, endIndex).trim();

  if (endIndex != rawMessage.length) {
    index = endIndex + 1;
    rawParameters = rawMessage.slice(index);
  }

  parsedMessage.command = parseCommand(rawCommand);

  if (parsedMessage.command === null) {
    return null;
  } else {
    if (rawTags !== null) {
      parsedMessage.tags = parseTags(rawTags);
    }
  }

  parsedMessage.command = parseCommand(rawCommand);

  if (parsedMessage.command === null) {
    // Is null if it's a message we don't care about.
    return null;
  } else {
    if (rawTags !== null) {
      // The IRC message contains tags.
      parsedMessage.tags = parseTags(rawTags);
    }

    parsedMessage.source = parseSource(rawSource);
    parsedMessage.message = rawParameters.trim();

    if (rawParameters && rawParameters[0] === '!') {
      // The user entered a bot command in the chat window.
      parsedMessage.command = parseParameters(rawParameters, parsedMessage.command);
    }
  }

  return parsedMessage;
}

function parseCommand(rawCommandComponent: string): TwitchParsedCommand {
  let parsedCommand: TwitchParsedCommand = null;
  const commandParts: string[] = rawCommandComponent.split(' ');

  switch (commandParts[0]) {
    case 'JOIN':
    case 'PART':
    case 'NOTICE':
    case 'CLEARCHAT':
    case 'HOSTTARGET':
    case 'PRIVMSG':
      parsedCommand = {
        type: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case 'PING':
      parsedCommand = {
        type: commandParts[0],
      };
      break;
    case 'CAP':
      parsedCommand = {
        type: commandParts[0],
        isCapRequestEnabled: commandParts[2] === 'ACK' ? true : false,
        // The parameters part of the messages contains the
        // enabled capabilities.
      };
      break;
    case 'GLOBALUSERSTATE': // Included only if you request the /commands capability.
      // But it has no meaning without also including the /tags capability.
      parsedCommand = {
        type: commandParts[0],
      };
      break;
    case 'USERSTATE': // Included only if you request the /commands capability.
    case 'ROOMSTATE': // But it has no meaning without also including the /tags capabilities.
      parsedCommand = {
        type: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case 'RECONNECT':
      console.log('The Twitch IRC server is about to terminate the connection for maintenance.');
      parsedCommand = {
        type: commandParts[0],
      };
      break;
    case '421':
      console.log(`Unsupported IRC command: ${commandParts[2]}`);
      return null;
    case '001': // Logged in (successfully authenticated).
      parsedCommand = {
        type: commandParts[0],
        channel: commandParts[1],
      };
      break;
    case '002': // Ignoring all other numeric messages.
    case '003':
    case '004':
    case '353': // Tells you who else is in the chat room you're joining.
    case '366':
    case '372':
    case '375':
    case '376':
      console.log(`numeric message: ${commandParts[0]}`);
      return null;
    default:
      console.log(`\nUnexpected command: ${commandParts[0]}\n`);
      return null;
  }

  return parsedCommand;
}

function parseTags(rawTags: string): TwitchParsedTags {
  const tagsToIgnore = {
    // List of tags to ignore.
    'client-nonce': null,
    flags: null,
  };

  let dictParsedTags: TwitchParsedTags = {}; // Holds the parsed list of tags.
  // The key is the tag's name (e.g., color).
  let parsedTags: string[] = rawTags.split(';');

  parsedTags.forEach((tag) => {
    let parsedTag: string[] = tag.split('='); // Tags are key/value pairs.
    let tagValue: string | null = parsedTag[1] === '' ? null : parsedTag[1];

    switch (
      parsedTag[0] // Switch on tag name
    ) {
      case 'badges':
      case 'badge-info':
        // badges=staff/1,broadcaster/1,turbo/1;

        if (tagValue) {
          let dict: BadgeObjectsDictionary = {}; // Holds the list of badge objects.
          // The key is the badge's name (e.g., subscriber).
          let badges: string[] = tagValue.split(',');
          badges.forEach((pair) => {
            let badgeParts: string[] = pair.split('/');
            dict[badgeParts[0]] = badgeParts[1];
          });
          dictParsedTags[parsedTag[0]] = dict;
        } else {
          dictParsedTags[parsedTag[0]] = null;
        }
        break;
      case 'emotes':
        // emotes=25:0-4,12-16/1902:6-10

        if (tagValue) {
          let dictEmotes: EmotesObjectsDictionary = {}; // Holds a list of emote objects.
          // The key is the emote's ID.
          let emotes: string[] = tagValue.split('/');

          emotes.forEach((emote) => {
            let emoteParts: string[] = emote.split(':');

            // The list of position objects that identify
            // the location of the emote in the chat message.
            let textPositionsList: EmotesPositionList[] = [];
            let positions: string[] = emoteParts[1].split(',');

            positions.forEach((position) => {
              let positionParts: string[] = position.split('-');

              textPositionsList.push({
                startPosition: positionParts[0],
                endPosition: positionParts[1],
              });
            });
            console.log('type', typeof textPositionsList, textPositionsList);

            dictEmotes[emoteParts[0]] = textPositionsList;
          });

          dictParsedTags[parsedTag[0]] = dictEmotes;
        } else {
          dictParsedTags[parsedTag[0]] = null;
        }

        break;
      case 'emote-sets':
        // emote-sets=0,33,50,237
        if (tagValue) {
          let emoteSetIds: string[] = tagValue.split(','); // Array of emote set IDs.
          dictParsedTags[parsedTag[0]] = emoteSetIds;
        }

        break;
      default:
        // If the tag is in the list of tags to ignore, ignore
        // it; otherwise, add it.

        if (tagsToIgnore.hasOwnProperty(parsedTag[0])) {
        } else {
          dictParsedTags[parsedTag[0]] = tagValue;
        }
    }
  });

  return dictParsedTags;
}

function parseSource(rawSource: string | null): TwitchParsedSource {
  if (rawSource === null) {
    // Not all messages contain a source
    return null;
  } else {
    let sourceParts: string[] = rawSource.split('!');
    return {
      nick: sourceParts.length == 2 ? sourceParts[0] : null,
      host: sourceParts.length == 2 ? sourceParts[1] : sourceParts[0],
    };
  }
}

function parseParameters(rawParameters: string, command: TwitchParsedCommand): TwitchParsedCommand {
  let idx: number = 0;
  let commandParts: string = rawParameters.slice(idx + 1).trim();
  let paramsIdx: number = commandParts.indexOf(' ');

  if (command) {
    if (-1 == paramsIdx) {
      // no parameters
      command.botCommand = commandParts.slice(0);
    } else {
      command.botCommand = commandParts.slice(0, paramsIdx);
      command.botCommandParams = commandParts.slice(paramsIdx).trim();
      // TODO: remove extra spaces in parameters string
    }
  }

  return command;
}
