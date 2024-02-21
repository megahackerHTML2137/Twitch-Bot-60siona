import translateMessage from './CommandTranslator';

// Types
import type { ParsedTwitchMessage } from '../../types/parsedMessage';
import type { DataForTranslator } from '../../types/commandHandler';

const COMMANDS: Record<string, string> = {
  discord: 'Siema @{nick} mordo wbijaj na sztywnego diskorda {discord_link}',
  dupa: 'ale z ciebie dupa @{nick}',
};

export default function handleCommand(message: ParsedTwitchMessage): any {
  let msg: string;

  if (message) {
    if (message.source && message.command) {
      if (message.source.nick && message.command.botCommand) {
        const data: DataForTranslator = {
          nick: message.source.nick,
          discord_link: 'www.discord.com',
        };
        // Change placeholder to data
        msg = translateMessage(COMMANDS[message.command.botCommand], data);

        return msg;
      } else {
        return null;
      }
    }
  } else {
    console.error('No message');
  }
}
