import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';

import {
    BaseWalletAdapter,
    WalletReadyState,
} from '@solana/wallet-adapter-base';

import CrossPayClient from './CrossPayClient.ts'

import { PublicKey } from '@solana/web3.js';

import LoginWindow from './LoginWindow'

export const QRCodeWalletName = 'QR Code' as WalletName<'QRCodeWallet'>;

import { icon } from './icon'

export interface PhantomWalletAdapterConfig {
  serverHost?: string
}

export class QRCodeWalletAdapter extends BaseWalletAdapter {
    name = QRCodeWalletName;
    url = 'https://solana-crosspay.com';
    icon = icon;

    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _client: CrossPayClient;

    private _connecting: boolean;

    private _publicKey: PublicKey | null;

    constructor(config: QRWalletAdapterConfig = {}) {
        super();

        this._client = new CrossPayClient(config.serverHost || 'https://crosspay-server.onrender.com/')

        this.emit('readyStateChange', WalletReadyState.Loadable)
        //this.emit('readyStateChange', WalletReadyState.Installed)
    }

    get connecting() {
        return this._connecting;
    }

    get publicKey() {
        return this._publicKey;
    }

    get readyState() {
        return WalletReadyState.Loadable;
    }

    async connect(): Promise<void> {
        console.log("connect")

        try {

            if (this.connected || this.connecting) return;

            this._connecting = true;

            // this.emit('connect', publicKey);

        } catch (error: any) {
            this.emit('error', error);
            throw error;

        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        console.log("disconnect")
    }

    async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {

      console.log("send transaction", transaction)

        /*
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
        */
    }
}
