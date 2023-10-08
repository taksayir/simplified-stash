'use client'
import React from 'react';
import styles from './VideoGalleryItem.module.scss';

export interface VideoGalleryItemProps {
    path: string;
    name: string;
    title: string;
    details: string;
    image: string;
    phash: string;
}

const VideoGalleryItem: React.FC<VideoGalleryItemProps> = ({ phash, title, details, name, image }) => {
    const getBase64Image = (base64str: string) => {
        return `data:image/jpg;base64,${base64str}`;
    }

    return (
        <div className={styles.videoGalleryItem}>
            <div className={styles.videoImageCover}>
                <img src={getBase64Image(image)} />
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
