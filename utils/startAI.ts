import { Client } from "../structs/client.ts";
import { createJob, checkJob, getJobStatus } from "../structs/kobold.ts";
import { deleteMessage, getGuild, getMember, getUser, sendMessage } from "../deps.ts";
import { usersDB } from "./database.ts";

export function startAI(client: Client, channelID: string) {
    const messageHistory: [string, string][] = [];
const getContext = () => `This is a conversation between multiple [user#id]'s and [robot].
You are [robot]. Please use the below conversations context to create a response

${messageHistory.map(x => `[${x[0]}]: ${x[1]}`).join('\n')}
[robot]:`

client.OnMessageCreate(async(_bot, message) => {
    if (!(await usersDB.getUsers()).includes(message.authorId.toString()))
        return;

    if (message.channelId.toString() != channelID
    || !message.content
    || !message.guildId
    || message.isFromBot) return;

    const member = (await getMember(client.Bot, message.guildId, message.authorId)).user;
    if (!member) return;

    const guild = await getGuild(client.Bot, message.guildId)
    const user = await getUser(client.Bot, message.authorId)

    messageHistory.push([`${member.username}#${member.discriminator}`, message.content]);
        
    try {
        const createdJob = await createJob(getContext());
        console.log(`[INFO] [${guild.name}] Created job for message "${message.content}" from "${user.username}"`);
        let intervalID = 0;
        intervalID = setInterval(async() => {
            const jobCheck = await checkJob(createdJob.id);
            if (jobCheck.done == false) return;
            const jobStatus = await getJobStatus(createdJob.id);
            console.log(`[INFO] [${guild.name}] Got response for message "${message.content}" from "${user.username}"`);
            if (jobStatus.done == false || jobStatus.generations.length == 0) throw new Error("INVALID_RESPONSE");
            clearInterval(intervalID);
            await sendMessage(client.Bot, message.channelId, {  
                content: jobStatus.generations[0].text.split('\n')[0]
            });
            messageHistory.push(["robot", jobStatus.generations[0].text])

        }, 2000)
    } catch(err) {
        const sentMessage = await sendMessage(client.Bot, message.channelId, {
            content: `<@${message.authorId}> [System] Internal error, Please retry\nError: ${err}`
        });
        try {
            deleteMessage(client.Bot, sentMessage.channelId, sentMessage.id, 'CLEAR_ERROR', 15000);
            deleteMessage(client.Bot, message.channelId, message.id, 'CLEAR_ERROR', 15000);
        } catch { return }
    }
});
}