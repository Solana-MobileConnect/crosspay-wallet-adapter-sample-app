import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/App.module.css'
import { useEffect, useState } from 'react'
import { Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, TransactionInstruction, Keypair } from '@solana/web3.js'

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
                          <input id="amount" type="text" placeholder="e.g. 0.1" size="12" required />
                        </div>
                        <div>
                          <label>Receiver:</label>
                          <input id="receiver" type="text" placeholder="public key" size="25" required />
                        </div>
                        <div>
                        <button type="submit">Send</button>
                        </div>
                    </form>
                    </>
                    :
                    <span>Connect Your Wallet</span>
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
