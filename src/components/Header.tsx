import styles from '../styles/App.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Header() {
    return (
        <div className={styles.Header}>
          <div className={styles.HeaderContainer}>
            <span>Solana CrossPay</span>
            <span>QR Code wallet adapter</span>
            <WalletMultiButton />
          </div>
        </div>
    )
}
