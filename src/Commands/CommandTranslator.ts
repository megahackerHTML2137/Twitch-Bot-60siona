// Types
import type { DataForTranslator } from '../../types/commandHandler';

export default function translateMessage(messageToTranslate: string, data: DataForTranslator): string {
  for (const placeholder in data) {
    const regexp = new RegExp(`\\{${placeholder}\\}`, 'gi');
    messageToTranslate = messageToTranslate.replace(regexp, data[placeholder]);
  }

  return messageToTranslate;
}
