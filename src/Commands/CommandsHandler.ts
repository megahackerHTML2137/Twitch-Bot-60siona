import fs from 'node:fs';
import path from 'node:path';
import translateMessage from './CommandTranslator';

// Types
import type { ParsedTwitchMessage } from '../../types/parsedMessage';
import type { AnswerType, BotAnswer } from '../../types/commandHandler';

const COMMANDS_LOCALE_PATH = '/local/commands.json';

export default async function handleCommand(message: ParsedTwitchMessage): Promise<BotAnswer> {
  let botAnswer: AnswerType = {
    type: '',
    message: '',
  };

  if (message.command) {
    switch (message.command.type) {
      case 'PRIVMSG':
        // Currently, the bot reads commands from a file for every command request, which can be a little bit slow.
        // It needs to be configured to load the commands into memory at each startup.
        const allCommands: Record<string, string> | null = await getCommandsFromFile()
          .then((commands) => {
            return commands;
          })
          .catch((err) => {
            console.error('Error when getting commands file:', err);
            return null;
          });

        if (allCommands === null) {
          break;
        }

        botAnswer.type = 'PRIVMSG';
        botAnswer.channel = message.command.channel;
        if (message.source) {
          if (message.source.nick) {
            botAnswer.nick = message.source.nick;
          }
        }

        if (message.command.botCommand) {
          if (Object.keys(allCommands).includes(message.command.botCommand)) {
            botAnswer.message = allCommands[message.command.botCommand];
          } else {
            botAnswer.message = '{NO_COMMAND}';
          }
        }

        break;
      case 'PING':
        botAnswer.type = 'PONG';
        botAnswer.message = message.message;
        break;
    }

    // Change placeholder to data
    botAnswer = await translateMessage(botAnswer);

    return botAnswer;
  } else {
    return null;
  }
}

async function getCommandsFromFile(): Promise<Record<string, string>> {
  let commands: Record<string, string> = {};

  try {
    let data = await fs.readFileSync(path.join(__dirname, '..', COMMANDS_LOCALE_PATH), 'utf8');

    commands = JSON.parse(data);

    if (commands) {
      if (Object.keys(commands).length <= 0) {
        throw new Error(`NO COMMANDS, ADD SOME TO ${COMMANDS_LOCALE_PATH} FILE`);
      }
    }
  } catch (err) {
    throw new Error(`PROBABLY NO FILE OR NO COMMANDS IN ${COMMANDS_LOCALE_PATH}`);
  }

  return commands;
}
