import { getDb } from "./getDb";

export type FileType = {
    id: number;
    path: string;
    phash: string;
    cover_id: number | null;
    cover_data: string | null;
    created_at: string;
    updated_at: string;
    scene_title: string;
    scene_details: string;
    scene_cover_data: string | null;
}

export const getFiles = async (limit: number = 10, phash: string | null = null): Promise<FileType[]> => {
    const knex = getDb();
    const data = await knex.select('files.*', 'file_cover.data as cover_data', 'scenes.title as scene_title', 'scenes.details as scene_details', 'scene_cover.data as scene_cover_data')
        .from('files')
        .leftJoin('blob as file_cover', 'files.cover_id', '=', 'file_cover.id')
        .leftJoin('scenes', 'files.phash', '=', 'scenes.phash')
        .leftJoin('blob as scene_cover', 'scenes.cover_id', '=', 'scene_cover.id')
        .orderBy('files.id', 'desc').limit(limit)
        .where((builder) => {
            if (phash) {
                builder.where('files.phash', '=', phash)
            }
        })
        

    console.log(data)
    return data;
}