import React, { use, useEffect } from 'react';
import styles from './VideoGallery.module.scss';
import { getDb } from '@/database/getDb';
import { getFiles } from '@/database/getFiles';
import VideoGalleryItem, { VideoGalleryItemProps } from './VideoGalleryItem/VideoGalleryItem';


const getFileName = (path: string) => {
    const fileName = path.split('/').pop();
    if (!fileName) {
        return 'n/a'
    }
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return fileNameWithoutExt;
}

const VideoGallery = async () => {
    const dbFiles = await getFiles();
    console.log(dbFiles)
    return (
        <div className={styles.videoGalleryContainer}>
            <h1>Video Gallery</h1>
            <div className={styles.videoGallery}>
                {dbFiles.map((file, index) => {
                    return (
                        <VideoGalleryItem
                            key={index}
                            path={file.path}
                            name={getFileName(file.path)}
                            title={null}
                            detail={null}
                            image={file.cover_data || ''}
                        />
                    )
                })}
            </div>
        </div>
    );
};

export default VideoGallery;
