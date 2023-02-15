console.clear();
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { Client } from "./structs/client.ts";
import {
    createJob,
    checkJob,
    getJobStatus
} from "./kobold.ts";
import { deleteMessage, getGuild, getMember, getUser, sendMessage } from "./deps.ts";

const client = new Client({
    token: Deno.env.get("DISCORD_TOKEN") || '',
    intents: 37377,
});

client.Login()
    .then(async() => console.log(`[SUCCESS] Logged in as: ${(await getUser(client.Bot, client.Bot.id)).username}`))

const messageHistory: [string, string][] = [];
const getContext = () => `This is a conversation between multiple [user#id]'s and [robot].
You are [robot]. Please use the conversations context to create a realistic response

${messageHistory.map(x => `[${x[0]}]: ${x[1]}`).join('\n')}
[robot]:`

client.OnMessageCreate(async(_bot, message) => {
    if (message.channelId.toString() != Deno.env.get("CHANNEL_ID")
    || !message.content
    || !message.guildId
    || message.isFromBot) return;

    const member = (await getMember(client.Bot, message.guildId, message.authorId)).user;
    if (!member) return;

    const guild = await getGuild(client.Bot, message.guildId)
    const user = await getUser(client.Bot, message.authorId)
    console.log(`[INFO] [${guild.name}] Received messaged "${message.content}" from "${user.username}"`)

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