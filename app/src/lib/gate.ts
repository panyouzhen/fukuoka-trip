const KEY = 'fukuoka-trip-unlocked'

export function isUnlocked(): boolean {
  return localStorage.getItem(KEY) === '1'
}

export function tryUnlock(pass: string): boolean {
  const expected = import.meta.env.VITE_SHARE_PASSPHRASE
  if (expected && pass.trim() === expected) {
    localStorage.setItem(KEY, '1')
    return true
  }
  return false
}
