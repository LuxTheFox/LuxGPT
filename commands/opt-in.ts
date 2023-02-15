import { sendMessage } from "../deps.ts";
import { Command } from "../structs/command.ts";
import { usersDB } from "../utils/database.ts";

export default new Command({
    name: 'opt-in',
    description: 'Opt-in of using DiscordGPT',
    usage: '/opt-in',
    execute: async({ client, interaction }) => {
        if (!interaction.channelId) return;

        const found = await usersDB.findUser(interaction.user.id.toString());
        if (found) return sendMessage(client.Bot, interaction.channelId, {
            embeds: [{
                description: `<@${interaction.user.id}> You are already opted-in for message usage`
            }]
        })
        await usersDB.addUser(interaction.user.id.toString());

        sendMessage(client.Bot, interaction.channelId, {
            embeds: [{
                description: `<@${interaction.user.id}> You have opted-in for message usage`
            }]
        })
    }
});