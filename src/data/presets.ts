export interface Preset {
  id: number
  name: string
  category: string
  fileName: string
  downloadUrl: string
  previewGif: string
  description: string
  longDescription?: string
  dependencies?: string[]
  aeVersion?: string
  fileSize?: string
  author?: string
  tags?: string[]
}

export const categories = [
  { id: 'all', name: 'all presets' },
  { id: 'textAnims', name: 'text animations' },
  { id: 'transitions', name: 'transitions' },
  { id: 'shapeAnims', name: 'shape animations' },
  { id: 'effects', name: 'effects' },
  { id: 'backgrounds', name: 'backgrounds' },
  { id: 'scripts', name: 'scripts' },
]

const MANIFEST_URL = 'https://raw.githubusercontent.com/YOUR-USERNAME/critterFX-presets/main/manifest.json'

let cachedPresets: Preset[] | null = null

/**
 * fetch presets from github manifest
 */
export async function fetchPresets(): Promise<Preset[]> {
  // return cached if we already fetched
  if (cachedPresets) {
    return cachedPresets
  }

  try {
    const response = await fetch(MANIFEST_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.statusText}`)
    }
    
    const data = await response.json()
    cachedPresets = data.presets
    return data.presets
  } catch (error) {
    console.error('Failed to fetch presets:', error)
    // return empty array as fallback
    return []
  }
}

/**
 * refresh presets from github (force refetch)
 */
export async function refreshPresets(): Promise<Preset[]> {
  cachedPresets = null
  return fetchPresets()
}