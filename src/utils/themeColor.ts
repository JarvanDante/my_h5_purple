const read = (name: string, fallback: string) => {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export const themePrimary = () => read('--color-primary', '#ff32b4')
export const themePrimaryDeep = () => read('--color-primary-deep', '#f7339f')
export const themeChip = () => read('--color-accent-chip', '#ffb5d0')
export const themeHeroStops = () => ({
  from: read('--color-hero-from', '#2a0b1a'),
  mid: read('--color-hero-mid', '#6a1542'),
  to: themePrimary(),
})
