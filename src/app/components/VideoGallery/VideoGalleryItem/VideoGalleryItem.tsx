'use client'
import React from 'react';
import styles from './VideoGalleryItem.module.scss';
import { StashFilePerformer } from '@/database/getFiles';

export interface VideoGalleryItemProps {
    path: string;
    name: string;
    title: string;
    details: string;
    image: number | null;
    phash: string;
    performers: StashFilePerformer[];
    isLoading: boolean;
}

const VideoGalleryItem: React.FC<VideoGalleryItemProps> = ({ isLoading, title, details, name, image, performers }) => {
    return (
        <div className={styles.videoGalleryItem}>
            <div className={styles.videoImageCover}>
                <img src={`/api/getBlob/${image}`} />
                {isLoading &&
                    <div className={styles.loaderContainer}>
                        <div className={styles.loader}></div>
                    </div>
                }


            </div>
            <div className={styles.videoTitle}>
                {title || name}
            </div>
            <div className={styles.videoDetail}>
                {details}
            </div>
            <div className={styles.videoPerformerContainer}>
                {performers.map((each, index) => {
                    return (
                        <div className={styles.videoPerformer} key={index}>
                            <img className={styles.videoPerformerImage} src={`/api/getBlob/${each.imageId}`} />
                            <div className={styles.videoPerformerName}>{each.name}</div>
                        </div>
                    )
                })}

            </div>
        </div>
    );
};

export default VideoGalleryItem;
