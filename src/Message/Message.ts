interface ISendOptions {
  content: string;
  flags?: number;
}

interface PrimaryGuild {
  tag: string;
  identity_guild_id: string;
  identity_enabled: boolean;
  badge: string;
}

interface Clan {
  tag: string;
  identity_guild_id: string;
  identity_enabled: boolean;
  badge: string;
}

interface AvatarDecorationData {
  sku_id: string;
  expires_at: number;
  asset: string;
}

interface Author {
  username: string;
  bot: boolean;
  public_flags: number;
  primary_guild: PrimaryGuild | null;
  id: string;
  global_name: string | null;
  discriminator: string;
  collectibles: null | any[];
  clan: Clan | null;
  avatar_decoration_data: AvatarDecorationData | null;
  avatar: string | null;
}

interface Member {
  roles: any[];
  premium_since: null | string;
  pending: boolean;
  nick: string;
  mute: boolean;
  joined_at: string;
  flags: number;
  deaf: boolean;
  communication_disabled_until: null | string;
  banner: null | string;
  avatar: null | string;
}

/** @param {any} data - The message object
 * @param {string} token - Your bot token
 */
export class Message {
  type!: number;
  tts!: boolean;
  timestamp!: string;
  pinned!: boolean;
  nonce!: string;
  mentions!: any[];
  mention_roles!: any[];
  mention_everyone!: boolean;
  member!: Member;
  id!: string;
  flags!: number;
  embeds!: any[];
  edited_timestamp!: null | string;
  content!: string;
  components!: any[];
  channel_type!: number;
  channel_id!: string;
  author!: Author;
  attachments!: any[];
  guild_id!: string;

  client: {
    token: string;
  };

  constructor(data: any, token?: string) {
    Object.assign(this, data);

    this.client = {
      token: token ?? 'none',
    };

    if (this.nonce != null) {
      this.nonce = '';
    }

    if (!this.author) {
      this.author = {} as any;
    }
    if (this.author.bot === undefined) {
      this.author.bot = false;
    }
  }

  /** @param {string} content - The text to send */
  async send(content: string | ISendOptions) {
    await fetch(`https://discord.com/api/v10/channels/${this.channel_id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${this.client.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        typeof content === 'string'
          ? { content, flags: 0 }
          : { content: content.content, flags: content.flags ?? 0 },
      ),
    });
  }
}
