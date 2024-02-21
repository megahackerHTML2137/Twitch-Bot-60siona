import { WebSocket } from 'ws';
import 'dotenv/config';

import parseMessage from '../Commands/MessageParser';
import handleCommand from '../Commands/CommandsHandler';

// Types
import type { BotDefaultProperties } from '../../types/bot';
import type { ParsedTwitchMessage, TwitchParsedCommand } from '../../types/parsedMessage';

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
    const parsedMessage: ParsedTwitchMessage | null = parseMessage(twitchMessage);

    if (parsedMessage) {
      const answer = handleCommand(parsedMessage);

      if (answer) {
        this.sendMessage(answer);
      } else {
        console.log(parsedMessage);
      }
    } else {
      console.log('Fuck this message:', parsedMessage);
    }
  }

  public sendMessage(message: string) {
    this.ws.send(`PRIVMSG #hwdpjphttp692137 :${message}`);
  }
}

export default TwitchClient;
