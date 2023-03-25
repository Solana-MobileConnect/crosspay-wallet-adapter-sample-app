import Head from 'next/head'

import WalletContextProvider from '../components/WalletContextProvider.tsx'
import Header from '../components/Header.tsx'
import Main from '../components/Main.tsx'

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
