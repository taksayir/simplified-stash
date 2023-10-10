import { getDb } from "./getDb";

export type DbFile = {
    file_id: number;
    file_path: string;
    file_phash: string;
    file_cover_id: number | null;
    file_created_at: string;
    file_updated_at: string;
    scene_title: string;
    scene_details: string;
    scene_cover_id: number | null;
    scene_created_at: string;
    scene_updated_at: string;
}

export interface StashFile {
    phash: string;
    file: {
        path: string;
        imageId: number | null;
    },
    scene: {
        title: string;
        details: string;
        imageId: number | null;
    },
    performers: {
        name: string;
    }[],
}

export const getFiles = async (limit: number = 10, phash: string | null = null): Promise<StashFile[]> => {
    const knex = getDb();
    const dbFiles: DbFile[] = await knex('files')
        .leftJoin('scenes', 'files.phash', '=', 'scenes.phash')
        .select(
            { file_id: 'files.id' },
            { file_path: 'files.path' },
            { file_phash: 'files.phash' },
            { file_cover_id: 'files.cover_id' },
            { file_created_at: 'files.created_at' },
            { file_updated_at: 'files.updated_at' },
            { scene_title: 'scenes.title' },
            { scene_details: 'scenes.details' },
            { scene_cover_id: 'scenes.cover_id' },
            { scene_created_at: 'scenes.created_at' },
            { scene_updated_at: 'scenes.updated_at' },
        ).orderBy('files.id', 'desc').limit(limit)
        .where((builder) => {
            if (phash) {
                builder.where('files.phash', '=', phash)
            }
        })
    const files: StashFile[] = dbFiles.map((dbFile: DbFile) => {
        const file: StashFile = {
            phash: dbFile.file_phash,
            file: {
                path: dbFile.file_path,
                imageId: dbFile.file_cover_id,
            },
            scene: {
                title: dbFile.scene_title,
                details: dbFile.scene_details,
                imageId: dbFile.scene_cover_id,
            },
            performers: [],
        }
        return file;
    })

    return files;
}