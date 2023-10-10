'use client'
import React, { use, useCallback, useEffect, useState } from 'react';
import styles from './VideoGallery.module.scss';
import VideoGalleryItem, { VideoGalleryItemProps } from './VideoGalleryItem/VideoGalleryItem';
import { StashFile } from '@/database/getFiles';


const getFileName = (path: string) => {
    const fileName = path.split('/').pop();
    if (!fileName) {
        return 'n/a'
    }
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return fileNameWithoutExt;
}

const VideoGallery = () => {
    const [dbFiles, setDbFiles] = useState<StashFile[]>([]);
    const [loadingPhash, setLoadingPhash] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/getFiles');
                const data = await response.json();
                setDbFiles(data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [])

    const syncEach = async (phash: string) => {
        setLoadingPhash(phash);
        const res = await fetch(`/api/sync?phash=${phash}`);
        const json = await res.json();
        const data: StashFile = json.data;
        if (data?.phash) {
            setDbFiles(prevDbFiles => {
                const newDbFiles = [...prevDbFiles];
                const index = newDbFiles.findIndex((each) => each.phash === data.phash);
                if (index !== -1) {
                    newDbFiles[index] = data;
                }
                return newDbFiles;
            });
        }
        setLoadingPhash(null);
    }
    const sync = async () => {
        const newDbFiles = [...dbFiles];
        for (let i = 0; i < dbFiles.length; i++) {
            const file = newDbFiles[i];
            const phash = file.phash;
            if (phash) {
                await syncEach(phash);
            }
        }


    }
    return (
        <div className={styles.videoGalleryContainer}>
            <h1>Video Gallery</h1>
            <button onClick={() => sync()}>Sync</button>
            <div className={styles.videoGallery}>
                {dbFiles.map((each, index) => {
                    return (
                        <div
                            key={`${index}-${each.phash}`}
                            onClick={() => syncEach(each.phash || '')}
                        >
                            <VideoGalleryItem
                                path={each.file.path}
                                name={getFileName(each.file.path)}
                                title={each.scene.title}
                                details={each.scene.details}
                                image={each.scene.imageId || each.file.imageId || null}
                                phash={each.phash}
                                isLoading={loadingPhash === each.phash}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default VideoGallery;

