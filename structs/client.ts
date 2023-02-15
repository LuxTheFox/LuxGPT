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
  __dirname,
} from "../deps.ts";
import { TCommand } from "./command.ts";

export class Client {
  public commands = new Collection<string, TCommand>();
  public Bot: Bot;
  constructor(ClientOptions: CreateBotOptions) {
    this.Bot = createBot(ClientOptions);
  }

  async LoadCommands(path: string, devGuild?: string) {
    if (!isAbsolute(path)) path = join(__dirname, "..", path);
    for (const file of Deno.readDirSync(path)) {
      const command: TCommand = await import(join(path, file.name));
      this.commands.set(command.name, command);
    }

    devGuild
      ? upsertGuildApplicationCommands(
          this.Bot,
          devGuild,
          Array.from(this.commands.values())
        )
      : upsertGlobalApplicationCommands(
          this.Bot,
          Array.from(this.commands.values())
        );
  }

  OnMessageCreate(cb: (bot: Bot, message: Message) => unknown) {
    this.Bot.events.messageCreate = cb;
  }
  OnInteractionCreate(cb: (bot: Bot, interaction: Interaction) => unknown) {
    this.Bot.events.interactionCreate = cb;
  }

  OnCommandUsed(cb: (bot: Bot, interaction: Interaction) => unknown) {
    this.Bot.events.interactionCreate = (bot: Bot, interaction: Interaction) => {
      if (interaction.type != InteractionTypes.ApplicationCommand) return;

      cb(bot, interaction);
    }
  }

  async Login() {
    return await startBot(this.Bot);
  }
}
