import {
  startBot,
  createBot,
  CreateBotOptions,
  Bot,
  Message,
  InteractionTypes,
  Interaction,
  Collection,
  upsertGlobalApplicationCommands,
  upsertGuildApplicationCommands,
  join,
  isAbsolute,
  __dirname
} from "../deps.ts";
import { TCommand } from "./command.ts";

export class Client {
  public commands = new Collection<string, TCommand>();
  public Bot: Bot;
  constructor(ClientOptions: CreateBotOptions) {
    this.Bot = createBot(ClientOptions);
  }

  async LoadCommands(path: string, devGuild?: string) {
    if (!isAbsolute(path)) path = join(__dirname, path);
    for (const file of Deno.readDirSync(path)) {
      const command: TCommand = (await import('file://' + join(path, file.name))).default;
      this.commands.set(command.name, command);
      console.log(`[INFO] Loaded command: ${command.name}`)
    }
    
    try {
      devGuild
        ? await upsertGuildApplicationCommands(
          this.Bot,
          devGuild,
          Array.from(this.commands.values())
        )
        : await upsertGlobalApplicationCommands(
          this.Bot,
          Array.from(this.commands.values())
        );

        console.log('[SUCCESS] Uploaded all loaded commands');
    } catch {
      console.log('[ERROR] Failed to upload commands');
    }

    this.OnCommandUsed((_bot, command, interaction) => {
      command.execute({
        client: this,
        interaction: interaction
      });
    })
  }

  OnMessageCreate(cb: (bot: Bot, message: Message) => unknown) {
    this.Bot.events.messageCreate = cb;
  }
  OnInteractionCreate(cb: (bot: Bot, interaction: Interaction) => unknown) {
    this.Bot.events.interactionCreate = cb;
  }

  OnCommandUsed(cb: (bot: Bot, command: TCommand, interaction: Interaction) => unknown) {
    this.Bot.events.interactionCreate = (bot: Bot, interaction: Interaction) => {
      if (!interaction.guildId) return;
      if (interaction.type != InteractionTypes.ApplicationCommand) return;

      const command = this.commands.get(interaction.data?.name ?? '');
      if (!command) return;

      cb(bot, command, interaction);
    }
  }

  async Login() {
    return await startBot(this.Bot);
  }
}
