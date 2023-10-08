import { getDb } from "./getDb";

export type File = {
    id: number;
    path: string;
    phash: string;
    cover_id: number | null;
    cover_data: string | null;
    created_at: string;
    updated_at: string;
}

export const getFiles = async (): Promise<File[]> => {
    const knex = getDb();
    const data = await knex.select('files.*', 'blob.data as cover_data')
        .from('files')
        .leftJoin('blob', 'files.cover_id', '=', 'blob.id');
    return data;
}