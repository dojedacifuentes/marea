const PREFIX = 'marea_'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed:', e)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  },

  exportAll() {
    const data = {}
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => {
        try {
          data[k.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(k))
        } catch {
          data[k.replace(PREFIX, '')] = localStorage.getItem(k)
        }
      })
    return data
  },

  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value))
      } catch (e) {
        console.warn('Import failed for', key, e)
      }
    })
  },
}

export const downloadJSON = (data, filename = 'marea-backup.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
