import React from 'react'
import { useRouter } from 'next/router'
import { useTheme, useCursor } from 'hooks'

const Logo = () => {
  const router = useRouter()
  const { toggleTheme } = useTheme()
  const { onCursor } = useCursor()

  const handleClick = (e) => {
    e.preventDefault()
    router.push('/')
  }

  return (
    <div 
      className="w-16" 
      onClick={handleClick} 
      onMouseEnter={() => onCursor("hovered")}
      onMouseLeave={onCursor}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1063.22 320.4"
      >
        <path
          d="M1063.22,1.18V99.69L839.72,243.1l223.5.82v76.47L740.76,320V220.55l225.43-143-225.43-.27V0Zm-332-.65L730,320.39H632.23L489.86,98.69l-.81,221.7H413.13L413.51.53h98.74l142,223.62L654.49.53Zm-329,319.86H305.38L100,.53H185.4l140.5,221.3L325.1.53h76.7Zm-113.7,0H205.4L0,.53H85.41Z"
        />
      </svg>
    </div>
  )
}

export default Logo
