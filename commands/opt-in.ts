import { ApplicationCommandFlags, InteractionResponseTypes, sendInteractionResponse } from "../deps.ts";
import { Command } from "../structs/command.ts";
import { usersDB } from "../utils/database.ts";

export default new Command({
    name: 'opt-in',
    description: 'Opt-in of using DiscordGPT',
    usage: '/opt-in',
    execute: async({ client, interaction }) => {
        if (!interaction.channelId) return;

        const found = await usersDB.findUser(interaction.user.id.toString());
        if (found) return sendInteractionResponse(client.Bot, interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [{
                    description: `<@${interaction.user.id}> You are already opted-in for message usage`,
                    color: parseInt('#222244'.replace("#", ""), 16)
                }],
                flags: ApplicationCommandFlags.Ephemeral
            }
        })
        await usersDB.addUser(interaction.user.id.toString());

        sendInteractionResponse(client.Bot, interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [{
                    description: `<@${interaction.user.id}> You have opted-in for message usage`,
                    color: parseInt('#222244'.replace("#", ""), 16)
                }],
                flags: ApplicationCommandFlags.Ephemeral
            }
        })
    }
});