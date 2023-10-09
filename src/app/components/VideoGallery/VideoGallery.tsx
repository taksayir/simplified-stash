'use client'
import React, { use, useCallback, useEffect, useState } from 'react';
import styles from './VideoGallery.module.scss';
import { FileType, getFiles } from '@/database/getFiles';
import VideoGalleryItem, { VideoGalleryItemProps } from './VideoGalleryItem/VideoGalleryItem';


const getFileName = (path: string) => {
    const fileName = path.split('/').pop();
    if (!fileName) {
        return 'n/a'
    }
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return fileNameWithoutExt;
}

const VideoGallery = () => {
    const [dbFiles, setDbFiles] = useState<FileType[]>([]);
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
    const sync = async () => {
        const newDbFiles = [...dbFiles];
        for (let i = 0; i < dbFiles.length; i++) {
            const file = newDbFiles[i];
            const phash = file.phash;
            setLoadingPhash(phash);
            const res = await fetch(`/api/sync?phash=${phash}`);
            const json = await res.json();
            const data: FileType = json.data;
            if (data?.phash) {
                setDbFiles(prevDbFiles => {
                    const newDbFiles = [...prevDbFiles];
                    const index = newDbFiles.findIndex((file) => file.phash === data.phash);
                    if (index !== -1) {
                        newDbFiles[index] = data;
                    }
                    return newDbFiles;
                });
            }
        }
        setLoadingPhash(null);

    }
    return (
        <div className={styles.videoGalleryContainer}>
            <h1>Video Gallery</h1>
            <button onClick={() => sync()}>Sync</button>
            <div className={styles.videoGallery}>
                {dbFiles.map((file, index) => {
                    return (
                        <VideoGalleryItem
                            key={`${index}-${file.scene_title}`}
                            path={file.path}
                            name={getFileName(file.path)}
                            title={file.scene_title}
                            details={file.scene_details}
                            image={file.scene_cover_data || file.cover_data || ''}
                            phash={file.phash}
                            isLoading={loadingPhash === file.phash}
                        />
                    )
                })}
            </div>
        </div>
    );
};

export default VideoGallery;

