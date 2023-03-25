import Head from 'next/head'

import WalletContextProvider from '../components/WalletContextProvider'
import Header from '../components/Header'
import Main from '../components/Main'

export default function Home() {
  return (
    <>
      <Head>
        <title>CrossPay wallet adapter sample app</title>
      </Head>
      <WalletContextProvider>
        <Header />
        <Main />
      </WalletContextProvider >
    </>
  )
}
