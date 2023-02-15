import {
  CreateSlashApplicationCommand,
  Interaction,
  PermissionStrings,
} from "../deps.ts";
import { Client } from "./client.ts";

interface IExecuteFunction {
  client: Client;
  interaction: Interaction;
}

export type TCommand = {
  usage: string;
  requiredUserPermissions?: PermissionStrings[];
  execute: (data: IExecuteFunction) => unknown;
} & CreateSlashApplicationCommand;

export class Command {
  constructor(data: TCommand) {
    Object.assign(this, data);
  }
}
