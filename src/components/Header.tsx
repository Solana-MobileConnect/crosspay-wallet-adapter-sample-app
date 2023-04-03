import styles from '../styles/App.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../../public/logo.png'
import qrCodeLogo from '../../public/qr-code-logo.svg'

export default function Header() {
    return (
        <div className={styles.Header}>
          <div className={styles.HeaderContainer}>
            <Link href="/">
              <Image src={logo} alt="Solana CrossPay" />
            </Link>
            <div className={styles.HeaderTitle}>
              <Image width={60} height={60} src={qrCodeLogo} alt="" />
              <span>QR Code wallet adapter</span>
            </div>
            <WalletMultiButton />
          </div>
        </div>
    )
}
