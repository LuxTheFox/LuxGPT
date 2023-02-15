import { ApplicationCommandFlags, InteractionResponseTypes, sendInteractionResponse } from "../deps.ts";
import { Command } from "../structs/command.ts";
import { getMemory } from "../utils/startAI.ts";

export default new Command({
    name: 'memory',
    description: 'Get the bots current memory',
    usage: '/memory',
    execute: ({ client, interaction }) => {
        const memories = getMemory();
        sendInteractionResponse(client.Bot, interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [{
                    title: `A full list of my Memories`,
                    description: `${(Object.values(memories).map((x, i) => `My memories with <@${Object.keys(memories).at(i)}>\n` + (x.map(y => `[${y[0]}]: ${y[1]}`) || ['No memories found']).join('\n') + '\n')).join('\n')}` || `No memories found`,
                    color: parseInt('#222244'.replace("#", ""), 16)
                }],
                flags: ApplicationCommandFlags.Ephemeral
            }
        });
    }
})