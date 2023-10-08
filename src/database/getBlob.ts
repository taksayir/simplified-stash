import { getDb } from "./getDb";

export type File = {
    id: number;
    data: string;
    timestamp: string;
}

export const getFiles = async (): Promise<File[]> => {
    const knex = getDb();
    const data = await knex.select().from('files');
    return data;
}