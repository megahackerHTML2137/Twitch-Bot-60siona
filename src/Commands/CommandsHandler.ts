import translateMessage from './CommandTranslator';

// Types
import type { ParsedTwitchMessage } from '../../types/parsedMessage';
import type { DataForTranslator, AnswerType, BotAnswer } from '../../types/commandHandler';

const COMMANDS: Record<string, string> = {
  discord: 'Siema @{nick} mordo wbijaj na sztywnego diskorda {discord_link}',
  youtube: 'Siema @{nick} mordo wbijaj na sztywnego yt {youtube_link}',
  dupa: 'ale z ciebie dupa @{nick}',
};

export default function handleCommand(message: ParsedTwitchMessage): BotAnswer {
  // All comands // They will be loaded from file
  const allCommands = Object.keys(COMMANDS);

  let botAnswer: AnswerType = {
    type: '',
    message: '',
  };

  if (message.source?.nick && message.command?.botCommand && message.command.channel) {
    switch (message.command.type) {
      case 'PRIVMSG':
        botAnswer['type'] = 'PRIVMSG';
        botAnswer['channel'] = message.command.channel;

        // This data also will be loaded from file
        const dataForTranslator: DataForTranslator = {
          discord_link: 'www.discord.com',
          youtube_link: 'www.youtube.com',
        };

        dataForTranslator['nick'] = message.source.nick;

        if (allCommands.includes(message.command.botCommand)) {
          // Change placeholder to data
          botAnswer['message'] = translateMessage(COMMANDS[message.command.botCommand], dataForTranslator);

          return botAnswer;
        } else {
          botAnswer['message'] = translateMessage('@{nick} there is no command like this', dataForTranslator);

          return botAnswer;
        }
      case 'PING':
        botAnswer['type'] = 'PONG';
        botAnswer['message'] = message.message;
        return botAnswer;
      default:
        return null;
    }
  } else {
    return null;
  }
}
