# LuxGPT
 AI chat bot in Discord, Get normal, crazy and all the responses inbetween

### How to use
 - Download Deno: https://deno.land/
 - Download source code for LuxGPT: https://github.com/LuxTheFox/LuxGPT
 - Create `.env` with this format:
	```php
	DISCORD_TOKEN=EnterTokenHere #The Token to login with
	CHANNEL_ID=EnterChannelIDHere #The bots active channel
	KOBOLD_KEY=0000000000 # The API key, Default: 0000000000
	```
 - Run `deno run -A mod.ts` to start the bot
	 - Running with required permissions only:
	 - `deno run --allow-env --allow-read --allow-net mod.ts`
- Goto whichever channel you provided for `CHANNEL_ID` in `.env`
- Type a message and enjoy!
