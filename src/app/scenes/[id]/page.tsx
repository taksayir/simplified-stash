import Image from 'next/image'
import styles from './page.module.scss'
import { useEffect } from 'react'

export default function Home() {


  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.videoGalleryContainer}>
          <div className={styles.videoGallery}>
          </div>
        </div>
      </main>
    </div>
  )
}
