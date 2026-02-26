import { useCallback, useEffect, useState } from "react"

function getInitialTheme(): "dark" | "light" {
  const stored = localStorage.getItem("theme")

  if (stored === "light" || stored === "dark") return stored

  return "dark"
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }, [])

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme">
      {theme === "dark" ? "☀" : "☾"}
    </button>
  )
}
