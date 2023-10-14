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
    performer_id: number;
    performer_name: string;
    performer_cover_id: number | null;
}

export interface StashFilePerformer {
    name: string;
    imageId: number | null;
}

export interface StashFileScene {
    title: string;
    details: string;
    imageId: number | null;
}

export interface StashFile {
    id: number;
    phash: string;
    path: string;
    imageId: number | null;
    scene: StashFileScene,
    performers: StashFilePerformer[],
}

export const getFiles = async (limit: number = 10, phash: string | null = null): Promise<StashFile[]> => {
    const knex = getDb();
    const dbFiles: DbFile[] = await knex('files')
        .where((builder) => {
            if (phash) {
                builder.where('files.phash', '=', phash)
            }
        })
        .leftJoin('scenes', 'files.phash', '=', 'scenes.phash')
        .leftJoin('scene_performers', 'scenes.id', '=', 'scene_performers.scene_id')
        .leftJoin('performers', 'scene_performers.performer_id', '=', 'performers.id')
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
            { performer_id: 'performers.id' },
            { performer_name: 'performers.name' },
            { performer_cover_id: 'performers.cover_id' },
        )

    const files: StashFile[] = dbFiles.reduce((acc: StashFile[], curr: DbFile) => {
        const existingFile = acc.find(file => file.id === curr.file_id);
        const hasPerformer = curr.performer_id !== null;
        const performer: StashFilePerformer = {
            name: curr.performer_name,
            imageId: curr.performer_cover_id,
        }
        if (existingFile) {
            if (hasPerformer) {
                existingFile.performers.push(performer);
            }
        } else {
            const newFile: StashFile = {
                id: curr.file_id,
                path: curr.file_path,
                phash: curr.file_phash,
                imageId: curr.file_cover_id,
                scene: {
                    title: curr.scene_title,
                    details: curr.scene_details,
                    imageId: curr.scene_cover_id,
                },
                performers: hasPerformer ? [performer] : []
            };
            acc.push(newFile);
        }
        return acc;
    }, []);


    return files;
}