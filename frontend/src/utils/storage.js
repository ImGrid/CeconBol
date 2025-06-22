// Claves para localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ceconbol_access_token',
  REFRESH_TOKEN: 'ceconbol_refresh_token',
  USER_DATA: 'ceconbol_user_data',
  SEARCH_HISTORY: 'ceconbol_search_history',
  PREFERENCES: 'ceconbol_preferences'
}

// === TOKENS ===
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  }
}

export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }
}

export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

// === DATOS DE USUARIO ===
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  }
}

export const getUserData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

// === SESIÓN ===
export const hasActiveSession = () => {
  return !!(getAccessToken() && getUserData())
}

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_DATA)
}

// === HISTORIAL DE BÚSQUEDAS ===
export const saveSearchHistory = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return
  
  try {
    const history = getSearchHistory()
    const updatedHistory = [
      searchTerm,
      ...history.filter(term => term !== searchTerm)
    ].slice(0, 10) // Solo las últimas 10
    
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Error saving search history:', error)
  }
}

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error getting search history:', error)
    return []
  }
}

export const clearSearchHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
}

// === PREFERENCIAS ===
export const setUserPreferences = (preferences) => {
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}

export const getUserPreferences = () => {
  try {
    const preferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    return preferences ? JSON.parse(preferences) : {
      theme: 'light',
      language: 'es',
      notifications: true,
      searchFilters: {}
    }
  } catch (error) {
    console.error('Error getting preferences:', error)
    return {
      theme: 'light',
      language: 'es',
      notifications: true,
      searchFilters: {}
    }
  }
}

// Verifica si localStorage está disponible
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}