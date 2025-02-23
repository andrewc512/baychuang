import styles from "./header.module.css"
import Image from 'next/image'

export default function Header() {
  return (
    <header className={styles.header}>
      <Image src="/baymax.png" alt="baymax" width={70} height={70} />
    </header>
  )
}

