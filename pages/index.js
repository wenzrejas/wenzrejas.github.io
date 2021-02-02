import React from 'react'
import { MainLayout } from 'layouts'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <div className="content">
      <motion.span 
        className="heading heading-bg"
        whileHover={{
          scale: 1.1
        }}
      >
        Home
      </motion.span>
    </div>
  )
}

Home.Layout = MainLayout

export default Home