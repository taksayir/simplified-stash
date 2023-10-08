import React from 'react';
import styles from './VideoGalleryItem.module.scss';

export interface VideoGalleryItemProps {
    path: string;
    name: string;
    title: null;
    detail: null;
    image: string;
}

const VideoGalleryItem: React.FC<VideoGalleryItemProps> = ({ path, name, image }) => {
    const getBase64Image = (base64str: string) => {
        return `data:image/jpg;base64,${base64str}`;
    }
    return (
        <div className={styles.videoGalleryItem}>
            <div className={styles.videoImageCover}>
                <img src={getBase64Image(image)} />
            </div>
            <div className={styles.videoTitle}>
                {name}
            </div>
        </div>
    );
};

export default VideoGalleryItem;
