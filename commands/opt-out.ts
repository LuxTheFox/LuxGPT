import { sendMessage } from "../deps.ts";
import { Command } from "../structs/command.ts";
import { usersDB } from "../utils/database.ts";

export default new Command({
    name: 'opt-out',
    description: 'Opt-out of using DiscordGPT',
    usage: '/opt-out',
    execute: async({ client, interaction }) => {
        if (!interaction.channelId) return;

        const removed = await usersDB.removeUser(interaction.user.id.toString());
        if (!removed) return sendMessage(client.Bot, interaction.channelId, {
            embeds: [{
                description: `<@${interaction.user.id}> You are already opted-out of message usage`
            }]
        })
        
        sendMessage(client.Bot, interaction.channelId, {
            embeds: [{
                description: `<@${interaction.user.id}> You have opted-out of message usage`
            }]
        })
    }
});