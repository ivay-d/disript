interface ISendOptions {
  content: string;
  flags?: number;
}

/** Utilizies the .send function for getChannel.
 * @param {string} id - Channel ID to send message
 * @param {string} token - Your bots password
 */
export class Channel {
  id: string;
  token: string;

  constructor(id: string, token: string) {
    /** Channel ID */
    this.id = id;
    /** Bot Token */
    this.token = token;
  }
  /** @param {string} content - The text to send
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async send(content: string | ISendOptions): Promise<void> {
    const res = await fetch(`https://discord.com/api/v10/channels/${this.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${this.token}`, // What if I remove Bot text? 🤔
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        typeof content === 'string'
          ? { content, flags: 0 }
          : { content: content.content, flags: content.flags ?? 0 },
      ),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to send message, ${res.status} & ${err}`);
    }
  }
}
