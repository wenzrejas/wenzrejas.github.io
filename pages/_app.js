import React from 'react'
import { GlobalProvider } from 'context/GlobalContext'
import 'styles/globals.scss'

function MyApp({ Component, pageProps }) {
  const Layout = Component.Layout ? Component.Layout : React.Fragment

  return (
    <GlobalProvider>
      <Layout {...Component.LayoutProps || {}}>
        <Component {...pageProps} />
      </Layout>
    </GlobalProvider>
  )
}

export default MyApp
