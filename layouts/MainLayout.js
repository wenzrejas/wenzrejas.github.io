import React from 'react'
import Head from 'next/head'
import { Cursor, Header } from 'components'

const MainLayout = ({ title, description, children }) => {
  return (
    <>
      <Cursor />
      <Head>
        <title>{ title } - { description }</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>{ children }</main>
    </>
  )
}

MainLayout.defaultProps = { 
  title: "Creative Developer",
  description: "Wenz Louie Rejas"
}

export default MainLayout
