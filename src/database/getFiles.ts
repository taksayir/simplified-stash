import { getDb } from "./getDb";

export type File = {
    id: number;
    path: string;
    phash: string;
    cover_id: number | null;
    cover_data: string | null;
    created_at: string;
    updated_at: string;
    scene_title: string;
    scene_detail: string;
}

export const getFiles = async (): Promise<File[]> => {
    const knex = getDb();
    const data = await knex.select('files.*', 'blob.data as cover_data', 'scenes.title as scene_title', 'scenes.detail as scene_detail')
        .from('files')
        .leftJoin('blob', 'files.cover_id', '=', 'blob.id')
        .leftJoin('scenes', 'files.phash', '=', 'scenes.phash')
    return data;
}