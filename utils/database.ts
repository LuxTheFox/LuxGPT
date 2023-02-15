class Database {
    name: string;
    constructor(name: string) {
        this.name = name;
        try {
            Deno.lstatSync(name);
        } catch(error) {
            if (!(error instanceof Deno.errors.NotFound)) throw error;
            Deno.createSync(name)
        }
    }

    async getUsers(): Promise<string[]> {
        return (await Deno.readTextFile(this.name)).trim().split('\n');
    }

    async findUser(Identifier: string): Promise<string|undefined> {
        return (await this.getUsers()).find(i => i == Identifier)
    }

    async addUser(Identifier: string): Promise<string|undefined> {
        try {
            await Deno.writeTextFile(this.name, (await Deno.readTextFile(this.name)) + `${Identifier}\n`);
        } catch {
            return undefined;
        }
        return Identifier;
    }

    async removeUser(Identifier: string): Promise<string[]|undefined> {
        const users = await this.getUsers();
        try {
            const index = users.findIndex(i => i == Identifier);
            if (index == -1) throw new Error();

            users.splice(index, 1);
            await Deno.writeTextFile(this.name, users.join('\n') + (users.length == 0) ? '':'\n');
        } catch {
            return undefined;
        }
        return users
    }
}

const usersDB = new Database('./users.db');

export {
    usersDB
}