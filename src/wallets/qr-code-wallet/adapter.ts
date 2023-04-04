import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';

import {
  BaseWalletAdapter,
  WalletReadyState,
} from '@solana/wallet-adapter-base';

import CrossPayClient from './client'
import { TransactionState } from './client'

import QRCodeModal from './modal'

import { PublicKey, Transaction, TransactionVersion, VersionedTransaction, Connection, TransactionSignature } from '@solana/web3.js';

const util = require('util')

export const QRCodeWalletName = 'QR Code' as WalletName<'QRCodeWallet'>;

import { icon } from './icon'

export interface QRWalletAdapterConfig {
  serverHost?: string,
  serverNetwork?: string
}

export class QRCodeWalletAdapter extends BaseWalletAdapter {
  name = QRCodeWalletName;
  url = 'https://solana-crosspay.com';
  icon = icon;

  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0] as TransactionVersion[]);

  private _client: CrossPayClient;

  private _connecting: boolean = false;

  private _publicKey: PublicKey | null = null;

  private _modal: QRCodeModal;

  constructor(config: QRWalletAdapterConfig = {}) {
    super();

    this._client = new CrossPayClient(config.serverHost || 'https://crosspay-server.onrender.com', config.serverNetwork || 'devnet')
    this._modal = new QRCodeModal()
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    // To appear in the "Detected" list
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    console.log("connect")

    try {

      if (this.connected || this._connecting) return;

      this._connecting = true;

      await this._client.newLoginSession((public_key) => {
        console.log("Logged in:", public_key)

        this._connecting = false

        this._publicKey = new PublicKey(public_key)
        
        this.emit('connect', this._publicKey)

        this._modal.hide()
      })

      const loginQr = this._client.getLoginQr()
      
      this._modal.showLoginQR(loginQr, () => {

        console.log("Abort login")

        // stop polling
        this._client.loginSessionId = undefined

        this._connecting = false

        this._modal.hide()
      })

    } catch (error: any) {
      this.emit('error', error);
      throw error;

    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    console.log("disconnect")
    this._publicKey = null;
    this.emit('disconnect');
  }

  async sendTransaction<T extends Transaction>(
    transaction: T,
    connection: Connection,
    options: SendTransactionOptions = {}
  ): Promise<TransactionSignature> {

    console.log("Send transaction")

    const tx = transaction

    //console.log(util.inspect((tx as any).toJSON(), {depth:null}))

    if (!tx.feePayer) {
      throw new Error("feePayer must be set")
    }

    const that = this

    return new Promise((resolve, reject) => {
      /*
      function transactionSessionStateCallback(state: TransactionState) {
        console.log("TX state:", state)

        if ('signature' in state && (state['state'] == 'confirmed' || state['state'] == 'finalized')) {
          console.log("TX confirmed:", state['signature'])
          that._modal.style.visibility = 'hidden'
          resolve(state['signature'] as string)
        }

        if ('err' in state && state['err'] != null) {
          console.log("TX error:", state['err'])
          that._modal.style.visibility = 'hidden'
          reject(state['err'])
        }

      }

      this._client.newTransactionSession(tx, transactionSessionStateCallback).then(txSessionId => {

        const txQr = this._client.getTransactionQr(txSessionId)

        this._modal.innerHTML = ''

        this._modal.innerHTML = '<h1>Send transaction with QR</h1>'

        this._modal.style.visibility = 'visible'

        txQr.append(this._modal)

      }, reject)

      */
    })

  }
}
