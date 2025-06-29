"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.send = async function (token, channel, content) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
    });
    const data = await res.json();
};
