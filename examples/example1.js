const { Client } = require("disript");

async function test() {
  const client = new Client("Your Secret")

  client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.username}`);
  });

  client.on("newMessage", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!hi") {
      message.send("Hello!")
    } else if (message.content.startsWith("!send ") || message.content === "!send") {
      const args = message.content.slice(6).trim().split(/\s+/)

      if (args.length === 0 || !args[0]) {
        message.send("Provide a channel name or argument!");
        return;
      };
      await (await client.getChannel(args[0])).send("Hello!")
    }
  })

  client.login();
}
test()
