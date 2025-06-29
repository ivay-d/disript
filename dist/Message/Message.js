"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
/** @param {any} data - The message object
 * @param {string} token - Your bot token
 */
class Message {
    type;
    tts;
    timestamp;
    pinned;
    nonce;
    mentions;
    mention_roles;
    mention_everyone;
    member;
    id;
    flags;
    embeds;
    edited_timestamp;
    content;
    components;
    channel_type;
    channel_id;
    author;
    attachments;
    guild_id;
    client;
    constructor(data, token) {
        Object.assign(this, data);
        this.client = {
            token: token ?? "none"
        };
        if (this.nonce != null) {
            this.nonce = '';
        }
        if (!this.author) {
            this.author = {};
        }
        if (this.author.bot === undefined) {
            this.author.bot = false;
        }
    }
    /** @param {string} content - The text to send */
    async send(content) {
        await fetch(`https://discord.com/api/v10/channels/${this.channel_id}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${this.client.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content })
        });
    }
}
exports.Message = Message;
