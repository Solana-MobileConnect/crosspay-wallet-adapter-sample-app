import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';

import {
  BaseWalletAdapter,
  WalletReadyState,
} from '@solana/wallet-adapter-base';

import QRCodeStyling from '@solana/qr-code-styling';

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

      this._modal.showLoginQr(null, () => {
        console.log("Abort login")
        this._modal.hide()
      })
      
      await this._client.newLoginSession((public_key) => {
        console.log("Logged in:", public_key)

        this._connecting = false

        this._publicKey = new PublicKey(public_key)
        
        this.emit('connect', this._publicKey)

        this._modal.hide()
      })

      const loginQr = this._client.getLoginQr()
      
      this._modal.showLoginQr(loginQr, () => {

        console.log("Abort login")

        // stop polling
        this._client.loginSessionId = undefined

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
    
    let resolvePromise: any;
    let rejectPromise: any;

    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    }) as Promise<TransactionSignature>
    
    let txQr: QRCodeStyling | undefined = undefined;
    
    const that = this
    let txSessionId: string | undefined = undefined;

    function onTransactionClose() {
      console.log("Abort transaction")
      
      // stop polling
      if(txSessionId) that._client.transactionSessions[txSessionId].state = 'aborted'

      that._modal.hide()
    }

    function transactionSessionStateCallback(state: TransactionState) {
      console.log("TX state:", state)
      
      // For testing
      /*
      if(state['state'] == 'requested') {
        state['state'] = 'confirmed'
        state['err'] = 'some error'
      }
      */

      if ('err' in state && state['err'] != null) {
        console.log("TX error:", state['err'])

        txQr !== undefined && that._modal.showTransactionQr(txQr, onTransactionClose, state)

        rejectPromise(new Error(state['err']))
      } else {

        if ('signature' in state && (state['state'] == 'confirmed' || state['state'] == 'finalized')) {
          console.log("TX confirmed:", state['signature'])
          resolvePromise(state['signature'] as string)
          that._modal.hide()
        } else {
          // states: 'init', 'requested'
          txQr !== undefined && that._modal.showTransactionQr(txQr, onTransactionClose, state)
        }

      }
    }

    this._client.newTransactionSession(tx, transactionSessionStateCallback).then(
      (value) => {
        txSessionId = value;
        txQr = this._client.getTransactionQr(txSessionId)
      },
      (error: any) => {
        console.error(error)
        rejectPromise(error)
      }
    )
    
    this._modal.showTransactionQr(null, () => {
      console.log("Abort transaction")
      this._modal.hide()
    }, {state: 'init'})

    return promise
  }
}
