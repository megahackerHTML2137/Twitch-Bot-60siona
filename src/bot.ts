import TwitchClient from './Client/TwitchClient';

// Types
import type { BotDefaultProperties } from '../types/bot';

const BOT_DEFAULT: BotDefaultProperties = {
  channels: ['hwdpjphttp692137'],
  identity: {
    username: process.env.BOT_USERNAME || 'username',
    auth: process.env.BOT_AUTH || 'auth',
  },
};

const BotClient = new TwitchClient(BOT_DEFAULT);
