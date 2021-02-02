import React from 'react'
import { useRouter } from 'next/router'
import { useCursor } from 'hooks'
import Logo from './Logo'

const Header = () => {
  const router = useRouter()
  const { onCursor } = useCursor()

  const handleClick = (e) => {
    e.preventDefault()
    router.push('/about')
  }

  return (
    <header>
      <Logo />

      <span
        className="heading"
        onClick={handleClick}
        onMouseEnter={() => onCursor("hovered")}
        onMouseLeave={onCursor}
      >ABOUT</span>
    </header>
  )
}

export default Header
