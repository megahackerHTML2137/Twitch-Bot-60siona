import translateMessage from './CommandTranslator';

// Types
import type { ParsedTwitchMessage } from '../../types/parsedMessage';
import type { DataForTranslator, AnswerType, BotAnswer } from '../../types/commandHandler';

const COMMANDS: Record<string, string> = {
  youtube: 'Siema @{nick} mordo wbijaj na sztywnego yt {youtube_link}',
  dupa: 'ale z ciebie dupa @{nick}',
};

export default function handleCommand(message: ParsedTwitchMessage): BotAnswer {
  // All comands // They will be loaded from file
  const allCommands = Object.keys(COMMANDS);

  // This data also will be loaded from file
  const dataForTranslator: DataForTranslator = {
    discord_link: 'www.discord.com',
    youtube_link: 'www.youtube.com',
    NO_COMMAND: 'Mordo nie ma takiej komendy @{nick} !!!',
  };

  let botAnswer: AnswerType = {
    type: '',
    message: '',
  };

  if (message.command) {
    switch (message.command.type) {
      case 'PRIVMSG':
        botAnswer.type = 'PRIVMSG';
        botAnswer.channel = message.command.channel;

        if (message.source) {
          if (message.source.nick) {
            dataForTranslator['nick'] = message.source.nick;
          }
        }

        if (message.command.botCommand) {
          if (allCommands.includes(message.command.botCommand)) {
            botAnswer.message = COMMANDS[message.command.botCommand];
            break;
          } else {
            botAnswer.message = '{NO_COMMAND}';
            break;
          }
        }
      case 'PING':
        botAnswer.type = 'PONG';
        botAnswer.message = message.message;
        return botAnswer;
    }

    // Change placeholder to data
    botAnswer.message = translateMessage(botAnswer.message, dataForTranslator);

    return botAnswer;
  } else {
    return null;
  }
}
