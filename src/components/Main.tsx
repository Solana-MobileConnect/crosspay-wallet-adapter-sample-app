import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/App.module.css'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, TransactionInstruction, Keypair } from '@solana/web3.js'

const util = require('util')

import { v4 as uuid } from 'uuid'

export default function Main() {

  const [txSig, setTxSig] = useState('');
  const [balanceStatus, setBalanceStatus] = useState("unknown");
  const isTransacting = useRef<boolean>(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();

  const onConnect = useCallback(async (publicKey: PublicKey) => {
    console.log("Connected:", publicKey.toString())

    try {

      setBalanceStatus("loading...")
      const balance = await connection.getBalance(publicKey)

      if (balance >= 1 * LAMPORTS_PER_SOL) {

        setBalanceStatus((balance / LAMPORTS_PER_SOL) + " SOL")

      } else {
        isTransacting.current = true;

        setBalanceStatus("airdrop...")

        console.log("Request airdrop of 1 SOL...")
        const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);

        console.log("Finalize transaction...")
        await connection.confirmTransaction(signature, "finalized");

        const balance = await connection.getBalance(publicKey)
        setBalanceStatus((balance / LAMPORTS_PER_SOL) + " SOL")
        
        isTransacting.current = false;
        
        console.log("Finalized")
      }
    } catch (error: any) {
      console.error(error)
      setBalanceStatus("error")
    }
  }, [connection, setBalanceStatus])

  const onDisconnect = useCallback(() => {
    console.log("Wallet disconnected")
    setBalanceStatus("unknown")
    setTxSig('')
  }, [setTxSig])

  useEffect(() => {

    if (wallet !== null) {
      wallet.adapter.on('connect', onConnect)
      wallet.adapter.on('disconnect', onDisconnect)

      return () => {
        wallet.adapter.off('connect', onConnect)
        wallet.adapter.off('disconnect', onDisconnect)

      }
    }

  }, [onConnect, onDisconnect, wallet])

  const sendSol = useCallback((event: any) => {

    event.preventDefault()

    if (!connection || !publicKey) {
      alert("Please connect your wallet")
      return
    }

    if (isTransacting.current) {
      alert("Please wait for the previous transaction to complete")
      return
    }

    setTxSig('');
    isTransacting.current = true;

    (
      async () => {
        const receiver = event.target.receiver.value
        const amount = event.target.amount.value

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

        try {

          const latestBlockhash = await connection.getLatestBlockhash()
          tx.recentBlockhash = latestBlockhash.blockhash

          const sig = await sendTransaction(tx, connection)

          console.log("transaction signature: ", sig)
          setTxSig(sig)

          setBalanceStatus("loading...")
          console.log("Finalize transaction...")
          await connection.confirmTransaction(sig, "finalized")

          console.log("Finalized")

          const balance = await connection.getBalance(publicKey)

          console.log("New balance:", balance / LAMPORTS_PER_SOL)

          setBalanceStatus((balance / LAMPORTS_PER_SOL) + " SOL")

        } catch (error: any) {
          console.error(error)
        } finally {
          isTransacting.current = false;
        }

      }
    )().catch(console.error)

  }, [setTxSig, connection, publicKey])

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.textBox}>
          <h1>Demo</h1>
          <p>Even though this dApp runs in your browser, you can interact with it using your <b>mobile wallet</b>!</p>
          <p>It allows you to login and transfer some funds on devnet -- using QR codes.</p>
          <p>For more info, check out <a href="https://solana-crosspay.com">Solana CrossPay</a>.</p>
        </div>

        <div className={styles.textBox}>
          <h1>Send SOL</h1>
          {
            publicKey ?
              <>
                <p>Wallet: {publicKey.toString()}</p>
                <p>Balance: {balanceStatus}</p>
                <form onSubmit={sendSol} className={styles.sendSolForm}>
                  <div>
                    <label>Amount to send (in SOL):</label>
                    <input id="amount" type="text" defaultValue="0.001" size={4} required />
                  </div>
                  <div>
                    <label>Receiver:</label>
                    <input id="receiver" type="text" defaultValue="4Z9jDh3yJ8Grz2Y1BnQXQpj2RUA3zLTniM2hcsaqmhm6" size={40} required />
                  </div>
                  <div>
                    <button type="submit">Send</button>
                  </div>
                </form>
              </>
              :
              <>

                <p>Try it yourself:</p>
                <p>1. Choose a mobile wallet with Solana Pay support (Phantom, Solflare and Glow are fine!)</p>
                <p>2. Change your mobile wallet&apos;s network to <b>devnet</b></p>
                <p>3. Click &quot;Select wallet&quot;</p>
                <p>4. Select &quot;QR Code&quot;</p>
              </>
          }
          {
            publicKey && txSig &&
            <>
              <h1>Success!</h1>
              <p>Transaction signature: <a target="_blank" href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}>{txSig}</a></p>
            </>
          }
        </div>
      </div>
    </div>
  )
}
