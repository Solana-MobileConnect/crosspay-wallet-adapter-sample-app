import { FC, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
require('@solana/wallet-adapter-react-ui/styles.css')

import { QRCodeWalletAdapter } from '../wallets/qr-code-wallet/adapter'

import QRWindow from './QRWindow'

import {useState, useMemo} from 'react'

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {

    const [val, setVal] = useState("None")

    const wallets = useMemo(() => [
      new QRCodeWalletAdapter({}, setVal),
      //new PhantomWalletAdapter(),
    ],[])

    const endpoint = web3.clusterApiUrl('devnet')

    return (
        <ConnectionProvider endpoint={endpoint}>
            <QRWindow state={val} />
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    { children }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider
