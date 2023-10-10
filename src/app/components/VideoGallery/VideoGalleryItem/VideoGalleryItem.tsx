'use client'
import React from 'react';
import styles from './VideoGalleryItem.module.scss';

export interface VideoGalleryItemProps {
    path: string;
    name: string;
    title: string;
    details: string;
    image: number | null;
    phash: string;
    isLoading: boolean;
}

const VideoGalleryItem: React.FC<VideoGalleryItemProps> = ({ isLoading, title, details, name, image }) => {
    const getBase64Image = (base64str: string) => {
        return `data:image/jpg;base64,${base64str}`;
    }

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
        </div>
    );
};

export default VideoGalleryItem;
