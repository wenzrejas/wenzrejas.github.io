import { useEffect, useState } from 'react'

const useTheme = () => {
  const [theme, setTheme] = useState("light")
  
	const toggleTheme = () => {
		if (theme !== "dark") {
      localStorage.setItem("theme", "dark")

      document.documentElement.classList.add("dark")
			setTheme("dark")
		} else {
      localStorage.setItem("theme", "light")

      document.documentElement.classList.remove("dark")
			setTheme("light")
		}
  }
  
	useEffect(() => {
    const localTheme = localStorage.getItem("theme")
    
		if (localTheme === "light" || !("theme" in localStorage)) {
      document.documentElement.classList.remove("dark")
			setTheme("light")
		} else {
      document.documentElement.classList.add("dark")
      setTheme("dark")
    }
	}, [])

	return {
    theme,
    toggleTheme
  }
}

export default useTheme