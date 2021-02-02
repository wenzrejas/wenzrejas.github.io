import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGlobalStateContext } from 'context/GlobalContext'

const Cursor = () => {
  const { cursorType } = useGlobalStateContext()
  const [mousePosition, setMousePosition] = useState({
    x: null,
    y: null,
  })

  const onMouseMove = event => {
    const { x, y } = event
    setMousePosition({ x, y })
  }

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove)
      
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
    }
  }, [])
  
  return (
    (mousePosition.x !== null && mousePosition.y !== null) && (
      <>
        <motion.div
          className={`cursor`}
          initial={{
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
          }}
          animate={{ 
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
            scale: !!cursorType ? 0.5 : 1,
          }}
          transition={{ ease: "easeOut" }}
        />
        <motion.div
          className={`cursor-trail`}
          initial={{
            x: mousePosition.x - 17,
            y: mousePosition.y - 17,
          }}
          animate={{
            x: mousePosition.x - 17,
            y: mousePosition.y - 17,
            scale: !!cursorType ? 1.75 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </>
    )
  )
}

export default Cursor
