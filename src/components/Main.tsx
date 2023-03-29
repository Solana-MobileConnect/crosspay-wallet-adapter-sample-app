import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/App.module.css'
import { useState } from 'react'
import { Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, TransactionInstruction, Keypair } from '@solana/web3.js'

const util = require('util')

export default function Main() {

    const [txSig, setTxSig] = useState('');

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const sendSolExec = async (receiver, amount) => {

        const tx = new Transaction()

        const senderPubKey = publicKey
        const receiverPubKey = new PublicKey(receiver)

        tx.add(
          SystemProgram.transfer({
            fromPubkey: senderPubKey,
            toPubkey: receiverPubKey,
            lamports: LAMPORTS_PER_SOL * amount
          })
        )

        tx.add(
          new TransactionInstruction({
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            keys: [{pubkey: Keypair.generate().publicKey, isSigner: false, isWritable: false}],
            data: Buffer.alloc(0)
          })
        )

        tx.feePayer = senderPubKey

        const latestBlockhash = await connection.getLatestBlockhash()
        tx.recentBlockhash = latestBlockhash.blockhash

        console.log(util.inspect((tx as any).toJSON(), {depth:null}))

        sendTransaction(tx, connection).then(sig => {
            setTxSig(sig)
        })
    }

    const sendSol = event => {
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
                txSig ?
                    <div>
                        <p>View your transaction on </p>
                        <a href={link()}>Solana Explorer</a>
                    </div> :
                    null
            }
          </div>
        </div>
    )
}
