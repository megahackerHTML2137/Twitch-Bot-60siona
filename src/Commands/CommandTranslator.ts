import fs from 'node:fs';
import path from 'node:path';

// Types
import type { AnswerType, BotAnswer } from '../../types/commandHandler';

const TRANSLATE_DATA_LOCALE_PATH = '/local/data.json';

export default async function translateMessage(botAnswerToTranslate: AnswerType): Promise<AnswerType> {
  const data: Record<string, string> | null = await getTranslationsDataFromFile()
    .then((data) => {
      if (data) {
        return data;
      } else {
        return null;
      }
    })
    .catch((err) => {
      throw new Error(err);
    });

  if (data) {
    if (botAnswerToTranslate.nick) {
      data['nick'] = botAnswerToTranslate.nick;
    }

    for (const placeholder in data) {
      const regexp = new RegExp(`\\{${placeholder}\\}`, 'gi');
      botAnswerToTranslate.message = botAnswerToTranslate.message.replace(regexp, data[placeholder]);
    }

    return botAnswerToTranslate;
  } else {
    throw new Error('Translations empty');
  }
}

async function getTranslationsDataFromFile(): Promise<Record<string, string>> {
  let commands: Record<string, string> = {};

  try {
    let data = await fs.readFileSync(path.join(__dirname, '..', TRANSLATE_DATA_LOCALE_PATH), 'utf8');

    commands = JSON.parse(data);
  } catch (err) {
    throw new Error(`PROBABLY NO FILE IN ${TRANSLATE_DATA_LOCALE_PATH}`);
  }

  return commands;
}
