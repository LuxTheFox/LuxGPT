import { sendInteractionResponse, InteractionResponseTypes, ApplicationCommandFlags } from "../deps.ts";
import { Command } from "../structs/command.ts";
import { usersDB } from "../utils/database.ts";

export default new Command({
    name: 'opt-out',
    description: 'Opt-out of using DiscordGPT',
    usage: '/opt-out',
    execute: async({ client, interaction }) => {
        if (!interaction.channelId) return;
        const removed = await usersDB.removeUser(interaction.user.id.toString());
        if (!removed) return sendInteractionResponse(client.Bot, interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [{
                    description: `<@${interaction.user.id}> You are already opted-out of message usage`,
                    color: parseInt('#222244'.replace("#", ""), 16)
                }],
                flags: ApplicationCommandFlags.Ephemeral
            }
        })
        
        sendInteractionResponse(client.Bot, interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [{
                    description: `<@${interaction.user.id}> You have opted-out of message usage`,
                    color: parseInt('#222244'.replace("#", ""), 16)
                }],
                flags: ApplicationCommandFlags.Ephemeral
            }
        })
    }
});