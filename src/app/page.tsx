import Image from 'next/image'
import styles from './page.module.scss'
import { useEffect } from 'react'
import VideoGallery from './components/VideoGallery/VideoGallery'

export default function Home() {


  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.videoGalleryContainer}>
          <div className={styles.videoGallery}>
            <VideoGallery />
          </div>
        </div>
      </main>
    </div>
  )
}
