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
    
		if (localTheme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark")
			setTheme("dark")
		} else {
      document.documentElement.classList.remove("dark")
      setTheme("light")
    }
	}, [])

	return {
    theme,
    toggleTheme
  }
}

export default useTheme