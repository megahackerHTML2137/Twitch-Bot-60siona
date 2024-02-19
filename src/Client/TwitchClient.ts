import ws, { WebSocket } from 'ws';
import 'dotenv/config';

import parseMessage from '../Commands/parseMessage';

// Types
import type { BotDefaultProperties } from '../../types/bot';

const TWITCH_WEBSOCKET_IRC_SERVER = 'ws://irc-ws.chat.twitch.tv:80';
const HELLO_MESSAGE = 'kapus kapus inaczej 60siatka';

class TwitchClient {
  private ws: WebSocket;
  private channels: string[];

  constructor(props: BotDefaultProperties) {
    this.ws = new WebSocket(TWITCH_WEBSOCKET_IRC_SERVER, {});
    this.channels = props.channels;

    this.connect();
  }

  private connect(): void {
    this.ws.on('open', () => {
      // Auth
      this.ws.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
      this.ws.send(`PASS oauth:${process.env.BOT_AUTH}`);
      this.ws.send(`NICK bot60siona`);

      // Hello message
      for (const channel of this.channels) {
        this.ws.send(`JOIN #${channel}`);
        this.ws.send(`PRIVMSG #${channel} :${HELLO_MESSAGE}`);
      }

      // Listen to messages
      this.ws.on('message', (message) => {
        this.handleMessage(message.toString());
      });
    });
  }

  private handleMessage(twitchMessage: string) {
    console.log(parseMessage(twitchMessage));
  }
}

export default TwitchClient;
