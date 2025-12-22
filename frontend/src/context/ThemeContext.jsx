import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../services/api'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('Clair')
  const [primaryColor, setPrimaryColor] = useState('blue')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThemeFromUser()
  }, [])

  const loadThemeFromUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setTheme(user.theme || 'Clair')
        setPrimaryColor(user.primaryColor || 'blue')
        applyTheme(user.theme || 'Clair', user.primaryColor || 'blue')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (newTheme, newColor) => {
    const root = document.documentElement

    // Appliquer le mode sombre ou clair
    if (newTheme === 'Sombre') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Appliquer la couleur primaire
    const colorMap = {
      blue: { primary: '#3b82f6', primaryDark: '#2563eb' },
      green: { primary: '#10b981', primaryDark: '#059669' },
      purple: { primary: '#8b5cf6', primaryDark: '#7c3aed' },
      red: { primary: '#ef4444', primaryDark: '#dc2626' },
    }

    const colors = colorMap[newColor] || colorMap.blue

    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
  }

  const updateTheme = (newTheme, newColor) => {
    setTheme(newTheme)
    if (newColor) setPrimaryColor(newColor)
    applyTheme(newTheme, newColor || primaryColor)
  }

  const value = {
    theme,
    primaryColor,
    updateTheme,
    loading
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
