import Webstock from 'ws';
import os from 'os';
import { EventEmitter } from 'events';
import { Message } from '../Message';
import { Channel } from '../Channel';

const ws = new Webstock('wss://gateway.discord.gg/?v=10&encoding=json');

/** @param {string} token - Token of your bot
 *
 * @example
 * const { Client } = require("disript");
 *
 * async function test() {
 *   const client = new Client("Your Secret")
 *
 *   client.on("ready", (client) => {
 *     console.log(`Logged in as ${client.user.username}`);
 *   });
 *
 *   client.on("newMessage", async (message) => {
 *     if (message.author.bot) return;
 *
 *     if (message.content === "!hi") {
 *       message.send("Hello!")
 *     } else if (message.content.startsWith("!send ") || message.content === "!send") {
 *       const args = message.content.slice(6).trim().split(/\s+/)
 *
 *       if (args.length === 0 || !args[0]) {
 *         message.send("Provide a channel name or argument!");
 *         return;
 *       };
 *       await (await client.getChannel(args[0])).send("Hello!")
 *     }
 *   })
 *
 *   client.login();
 * }
 * test()
 */
export class Client extends EventEmitter {
  /** Checks if guilds are available */
  loaded: boolean = false;
  /** Stores your bot token */
  token: string;
  /** Stores current guild id */
  guild: string = '';
  /** Adds mobile status */
  mobile: boolean = false;

  constructor(token: string) {
    super();
    this.token = token;
  }

  /**
   * Does major things, mostly events. Logins to your bot.
   * @see {@link Message}
   */
  login() {
    ws.on('open', () => {});

    ws.on('message', (data) => {
      // Get the payload discord sends
      const payload = JSON.parse(data.toString());
      const { op, d } = payload;

      switch (op) {
        case 10:
          // Hello!
          setInterval(() => {
            ws.send(JSON.stringify({ op: 1, d: null }));
          }, d.heartbeat_interval);

          ws.send(
            JSON.stringify({
              op: 2,
              d: {
                token: this.token,
                // Intents (woah)
                intents: 33283,
                properties: {
                  os: os.platform(),
                  browser: this.mobile ? 'Discord Android' : 'Discord Client',
                  device: os.hostname(),
                },
              },
            }),
          );
          break;

        case 0:
          switch (payload.t) {
            case 'READY':
              this.emit('ready', payload.d);
              break;
            case 'MESSAGE_CREATE':
              if (!this.loaded) return; // Checks if guilds are available
              const msg = new Message(payload.d, this.token); // Activates the "send" function and objects
              this.emit('newMessage', msg);
              break;
            case 'GUILD_CREATE':
              this.loaded = true; // Now you can use newMessage event yayay
              this.guild = payload.d.id;

              this.emit('guildLoaded', payload.d);
              break;
            case 'GUILD_MEMBER_ADD':
              this.emit('newMember', payload.d);
              break;
            case 'INTERACTION_CREATE':
              switch (payload.d.type) {
                case 1:
                  // Ping... Pong!
                  fetch(
                    `https://discord.com/api/v10/interactions/${payload.d.id}/${payload.d.token}/callback`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 1 }),
                    },
                  );
                  break;
                case 2:
                  this.emit('newSlash', payload.d);
                  break;
                case 3:
                  this.emit('newComponent', payload.d);
                  break;
                case 4:
                  this.emit('newAutocomplete', payload.d);
                  break;
                case 5:
                  this.emit('newModal', payload.d);
                  break;
                default:
                  console.warn(`Unknown type: ${payload.d.type}.`);
                  break;
                  break;
              }
          }
        case 11:
          break;
      }
    });
  }
  /** @param {string} channel - Checks the current guild and gets the channel object.
   * @see {@link Channel}
   * @returns {Promise<Channel>}
   * @throws {Error}
   */
  async getChannel(channel: string): Promise<Channel> {
    const id = /^\d{17,19}$/.test(channel);
    let chan: any;

    if (id) {
      const res = await fetch(`https://discord.com/api/v10/channels/${channel}`, {
        headers: { Authorization: `Bot ${this.token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch channel by ID, ${res.status}`);
      chan = await res.json();
    } else {
      const res = await fetch(`https://discord.com/api/v10/guilds/${this.guild}/channels`, {
        headers: { Authorization: `Bot ${this.token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch channels for guild, ${res.status}`);
      const channels = await res.json();

      chan = channels.find((ch: any) => ch.name === channel.trim());
      if (!chan) throw new Error(`"${channel}" not found in guild`);
    }

    return new Channel(chan.id, this.token);
  }
}
