import { Client } from "../structs/client.ts";
import { createJob, checkJob, getJobStatus } from "../structs/kobold.ts";
import { addReaction, deleteMessage, getGuild, getMember, getUser, sendMessage, deleteOwnReaction } from "../deps.ts";
import { usersDB } from "./database.ts";

const MemoryCapacity = 8;
const MessageMemories: {[x: string]: [string, string][]} = {};

export function getMemory() {
    return MessageMemories;
}

export function startAI(client: Client, channelID: string) {
    const getContext = (userID: string) => `This is a conversation between multiple [user#id]'s and [robot].
You are [robot].

${MessageMemories[userID].map(x => `[${x[0]}]: ${x[1]}`).join('\n')}
[robot]:`

    client.OnMessageCreate(async(_bot, message) => {
        if (!(await usersDB.getUsers()).includes(message.authorId.toString()))
            return;

        if (message.channelId.toString() != channelID
        || !message.content
        || !message.guildId
        || message.isFromBot) return;

        if (message.content.startsWith('!clear')) {
            MessageMemories[message.authorId.toString()] = [];
            addReaction(client.Bot, message.channelId, message.id, '✅');
            return;
        }
        if (message.content.startsWith('!')) return;

        if (!MessageMemories[message.authorId.toString()]) MessageMemories[message.authorId.toString()] = [];

        const member = (await getMember(client.Bot, message.guildId, message.authorId)).user;
        if (!member) return;

        const guild = await getGuild(client.Bot, message.guildId)
        const user = await getUser(client.Bot, message.authorId)
        
        if (MessageMemories[message.authorId.toString()].length >= MemoryCapacity) MessageMemories[message.authorId.toString()].splice(0, 1);
        MessageMemories[message.authorId.toString()].push([`${member.username}#${member.discriminator}`, message.content]);
        try {
            const createdJob = await createJob(getContext(message.authorId.toString()));
            if (createdJob.message && createdJob.message.toLowerCase().includes('horde has entered maintenance mode'))
                throw new Error("API is currently offline, Please try again later");
            console.log(`[INFO] [${guild.name}] Created job for message "${message.content}" from "${user.username}"`);
            let intervalID = 0;
            await addReaction(client.Bot, message.channelId, message.id,  '🤔');
            intervalID = setInterval(async() => {
                const jobCheck = await checkJob(createdJob.id);
                if (jobCheck.done == false) return;
                const jobStatus = await getJobStatus(createdJob.id);
                console.log(`[INFO] [${guild.name}] Got response for message "${message.content}" from "${user.username}"`);
                if (jobStatus.done == false || jobStatus.generations.length == 0) throw new Error("INVALID_RESPONSE");
                clearInterval(intervalID);
                await deleteOwnReaction(client.Bot, message.channelId, message.id, '🤔');
                await sendMessage(client.Bot, message.channelId, {  
                    content: jobStatus.generations[0].text.trim().split('\n')[0] ?? '.',
                    messageReference: {
                        failIfNotExists: false,
                        channelId: message.channelId,
                        guildId: message.guildId,
                        messageId: message.id
                    }
                }).catch(async() => {
                    await sendMessage(client.Bot, message.channelId, {  
                        content: jobStatus.generations[0].text.trim().split('\n')[0] ?? '.'
                    })
                });
                if (MessageMemories[message.authorId.toString()].length >= MemoryCapacity) MessageMemories[message.authorId.toString()].splice(0, 1);
                MessageMemories[message.authorId.toString()].push(["robot", jobStatus.generations[0].text.trim().split('\n')[0] ?? '.'])

            }, 2000)
        } catch(err) {
            if (`${err}`.toLowerCase().includes('api is currently offline')) throw err
            const sentMessage = await sendMessage(client.Bot, message.channelId, {
                content: `<@${message.authorId}> [System] Internal error, Please retry\nError: ${err}`
            });
            try {
                deleteMessage(client.Bot, sentMessage.channelId, sentMessage.id, 'CLEAR_ERROR', 15000);
            } catch { return }
        }
    });
}