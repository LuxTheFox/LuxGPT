// export {
//   createBot,
//   Intents,
//   startBot,
//   sendMessage,
//   send
//   Bot,
// } from "https://deno.land/x/discordeno@18.0.1/mod.ts";
// export type { Message } from "https://deno.land/x/discordeno@18.0.1/mod.ts";
// export { Client } from "npm:discord.js";
export * from "https://deno.land/x/discordeno@18.0.1/mod.ts";
export { join, isAbsolute } from "https://deno.land/std@0.177.0/path/mod.ts";
import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.177.0/path/mod.ts";
export const __dirname = dirname(fromFileUrl(import.meta.url));
