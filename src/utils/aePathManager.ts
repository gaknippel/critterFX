import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

export interface AEInstallation
{
    version: string
    scripts_path: string
    user_presets_path: string
    exists: boolean
}

export interface PathConfig {
    custom_scripts_path?: string
    custom_presets_path?: string
}


export async function scanAEInstallations(): Promise<AEInstallation[]> {
  const installations = await invoke<AEInstallation[]>('scan_ae_installations')
  return installations
}


export async function verifyPath(path: string): Promise<boolean> {
  const isValid = await invoke<boolean>('verify_path', { path })
  return isValid
}

/**
 * get saved custom paths
 */
export async function getPathConfig(): Promise<PathConfig> {
  const config = await invoke<PathConfig>('get_path_config')
  return config
}

/**
 * save custom paths to config
 */
export async function savePathConfig(
  scriptsPath?: string,
  presetsPath?: string
): Promise<void> {
  await invoke('save_path_config', {
    scriptsPath,
    presetsPath,
  })
}

/**
 * open folder picker shi
 */
export async function pickFolder(): Promise<string | null> {
  const folder = await open({
    directory: true,
    multiple: false,
  })
  
  return folder || null
}

/**
 * Get the active installation paths (custom or auto-detected)
 */
export async function getActivePaths(): Promise<{
  scriptsPath: string | null
  presetsPath: string | null
  source: 'custom' | 'detected' | 'none'
}> {
  // first check for custom paths
  const config = await getPathConfig()
  
  if (config.custom_scripts_path || config.custom_presets_path) {
    return {
      scriptsPath: config.custom_scripts_path || null,
      presetsPath: config.custom_presets_path || null,
      source: 'custom'
    }
  }
  
  // fall back to auto-detection
  const installations = await scanAEInstallations()
  
  if (installations.length > 0) {
    // use the latest version found
    const latest = installations[0]
    return {
      scriptsPath: latest.scripts_path,
      presetsPath: latest.user_presets_path,
      source: 'detected'
    }
  }
  
  return {
    scriptsPath: null,
    presetsPath: null,
    source: 'none'
  }
}