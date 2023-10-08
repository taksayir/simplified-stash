'use client'
import React from 'react';
import styles from './VideoGalleryItem.module.scss';

export interface VideoGalleryItemProps {
    path: string;
    name: string;
    title: string;
    detail: string;
    image: string;
    phash: string;
}

const VideoGalleryItem: React.FC<VideoGalleryItemProps> = ({ phash, title, detail, name, image }) => {
    const getBase64Image = (base64str: string) => {
        return `data:image/jpg;base64,${base64str}`;
    }
    const sync = () => {
        fetch(`/api/sync?phash=${phash}`).then(res => res.json()).then(res => {
            console.log(res);
            alert('synced')
        }).catch(err => {
            console.log(err);
            alert('error')
        })
    }
    return (
        <div className={styles.videoGalleryItem} onClick={() => sync()}>
            <div className={styles.videoImageCover}>
                <img src={getBase64Image(image)} />
            </div>
            <div className={styles.videoTitle}>
                {title || name}
            </div>
            <div className={styles.videoDetail}>
                {detail}
            </div>
        </div>
    );
};

export default VideoGalleryItem;
