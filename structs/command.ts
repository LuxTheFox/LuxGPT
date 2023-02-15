import {
  CreateSlashApplicationCommand,
  Interaction,
  InteractionDataOption,
  PermissionStrings,
} from "../deps.ts";
import { client } from "./client.ts";

interface IExecuteFunction {
  client: client;
  interaction: Interaction;
  options: InteractionDataOption[];
}

export type TCommand = {
  usage: string;
  requiredUserPermissions: PermissionStrings[];
  execute: (data: IExecuteFunction) => unknown;
} & CreateSlashApplicationCommand;

export class Command {
  constructor(data: TCommand) {
    Object.assign(this, data);
  }
}
