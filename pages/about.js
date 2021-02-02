import React from 'react'
import { MainLayout } from 'layouts'
import { motion } from 'framer-motion'

const About = () => {
  return (
    <div className="content">
      <motion.span 
        className="heading heading-bg"
        whileHover={{
          scale: 1.1
        }}
      >
        About
      </motion.span>
    </div>
  )
}

About.Layout = MainLayout
About.LayoutProps = {
  title: "About"
}

export default About
