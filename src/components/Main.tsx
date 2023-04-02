import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/App.module.css'
import { useEffect, useState } from 'react'
import { Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, TransactionInstruction, Keypair } from '@solana/web3.js'

// TODO: top up devnet if low balance
// TODO: show balance

const util = require('util')

import { v4 as uuid } from 'uuid'

export default function Main() {

    const [txSig, setTxSig] = useState('');

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    useEffect(()=>{
      if(publicKey === null) {
        setTxSig('')
      }
    }, [publicKey])
   

    const sendSolExec = async (receiver: string, amount: string) => {
        
        if (!publicKey) return

        const tx = new Transaction()

        const senderPubKey = publicKey
        const receiverPubKey = new PublicKey(receiver)

        tx.add(
          SystemProgram.transfer({
            fromPubkey: senderPubKey,
            toPubkey: receiverPubKey,
            lamports: LAMPORTS_PER_SOL * Number(amount)
          })
        )
        
        tx.add(
          new TransactionInstruction({
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            keys: [],
            data: Buffer.from(uuid(), 'utf-8')
          })
        )
       
        tx.feePayer = senderPubKey

        const latestBlockhash = await connection.getLatestBlockhash()
        tx.recentBlockhash = latestBlockhash.blockhash

        sendTransaction(tx, connection).then(sig => {
            console.log("transaction signature: ", sig)
            setTxSig(sig)
        })
    }

    const sendSol = (event: any) => {
        event.preventDefault()
        
        if (!connection || !publicKey) { return }

        sendSolExec(event.target.receiver.value, event.target.amount.value).then(null, console.error)

    }

    return (
        <div className={styles.Main}>
          <div className={styles.MainContainer}>
            {
                publicKey ?
                    <>
                    <h2>Send SOL</h2>
                    <form onSubmit={sendSol} className={styles.sendSolForm}>
                        <div>
                          <label>Amount to send (in SOL):</label>
                          <input id="amount" type="text" placeholder="e.g. 0.1" size={12} required />
                        </div>
                        <div>
                          <label>Receiver:</label>
                          <input id="receiver" type="text" placeholder="public key" size={25} required />
                        </div>
                        <div>
                        <button type="submit">Send</button>
                        </div>
                    </form>
                    </>
                    :
                    <>
                      <div className={styles.textBox}>
                        <h1>Demo</h1>
                        <p>Even though this dApp runs in your browser, you can interact with it using your <b>mobile wallet</b>!</p>
                        <p>It allows you to login and transfer some funds on devnet -- using QR codes!</p>
                        <p>For more info, check out <a href="https://solana-crosspay.com">Solana CrossPay</a>.</p>
                      </div>

                      <div className={styles.textBox}>
                        <h1>Try it!</h1>
                        <p>1. Make sure your mobile wallet supports Solana Pay (such as Phantom, Solflare or Glow)</p>
                        <p>2. Change your mobile wallet's network to <b>devnet</b></p>
                        <p>3. Click "Select wallet"</p>
                        <p>4. Select "QR Code"</p>
                      </div>
                    </>
            }
            {
                publicKey && txSig ?
                    <div>
                        <p>Transaction signature: {txSig}</p>
                        <p><a target="_blank" href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}>Link</a></p>
                    </div> :
                    null
            }
          </div>
        </div>
    )
}
