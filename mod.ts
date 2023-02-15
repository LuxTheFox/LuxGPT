console.clear();
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { getUser,sendMessage } from "./deps.ts";
import { startAI } from "./utils/startAI.ts";
import { Client } from "./structs/client.ts";

const guildID = Deno.env.get("GUILD_ID");
if (!guildID) throw new Error("[DiscordGPT] Please provide a 'GUILD_ID' inside the '.env' file.")
const channelID = Deno.env.get("CHANNEL_ID");
if (!channelID) throw new Error("[DiscordGPT] Please provide a 'CHANNEL_ID' inside the '.env' file.")
const token = Deno.env.get("DISCORD_TOKEN");
if (!token) throw new Error("[DiscordGPT] Please provide a 'DISCORD_TOKEN' inside the '.env' file.")
const _apikey = Deno.env.get("KOBOLD_KEY");
if (!_apikey) throw new Error("[DiscordGPT] Please provide a 'KOBOLD_KEY' inside the '.env' file.\nIf you do not have a key provide the key: 0000000000")

const client = new Client({
    token: token || '',
    intents: 37377,
});

client.Bot.events.ready = async() => {
    console.log(`[SUCCESS] Logged in as: ${(await getUser(client.Bot, client.Bot.id)).username}`)
    sendMessage(client.Bot, channelID, {
        embeds: [{
            description: 'DiscordGPT is now online!',
            color: parseInt('#222244'.replace("#", ""), 16),
            timestamp: Date.now()
        }]
    });

    client.LoadCommands('commands', guildID)
    startAI(client, channelID);
};

client.Login()