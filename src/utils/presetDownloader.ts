// src/utils/presetDownloader.ts
import { invoke } from '@tauri-apps/api/core'
import { getActivePaths } from './aePathManager'
import type { Preset } from '@/lib/api'
import { downloadDir, join } from '@tauri-apps/api/path'


export interface DownloadProgress {
  downloaded: number
  total: number
  percentage: number
}

export interface InstallResult {
  success: boolean
  message: string
  installedPath?: string | null
}

/**
 * download raw file from url with wonky bit and chunk stuff
 */
async function downloadFile(
  file_url: string, 
  onProgress?: (progress: DownloadProgress) => void
): Promise<Uint8Array> {

  console.log("downloading from url", file_url)
  const response = await fetch(file_url)
  console.log("response status: ", response.status)
  console.log("response OK?", response.ok)
  
  if (!response.ok) 
    {
    console.error("download failed BRUH:", response.statusText)
    throw new Error(`download failed: ${response.statusText}`)
    }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  const reader = response.body?.getReader()
  if (!reader) 
    {
    throw new Error('failed to get response reader')
    }

  const chunks: Uint8Array[] = []
  let downloaded = 0

  while (true) 
  {
    const { done, value } = await reader.read()
    
    if (done) break
    
    chunks.push(value)
    downloaded += value.length

    if (onProgress) 
    {
      onProgress({
        downloaded,
        total,
        percentage: total > 0 ? Math.round((downloaded / total) * 100) : 0
      })
    }
  }

  // combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) 
  {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

/**
 * split filename to determine if its jsx or ffx file
 */
function getPresetType(fileName: string): 'script' | 'preset' | 'composition' {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext == 'jsx')
  {
    return 'script'
  }
  else if (ext == 'ffx')
  {
    return 'preset'
  }
  else if (ext == 'aep')
  {
    return 'composition'
  }
  else
  {
    throw new Error(`unknown file type: ${ext}`)
  }
}

/**
 * download and install a preset
 */
export async function downloadAndInstall(
  preset: Preset,
  onProgress?: (progress: DownloadProgress) => void
): Promise<InstallResult> {
  
  console.log('downloadAndInstall called, preset:', preset)
  console.log('file_url:', preset.file_url)
  console.log('file_name:', preset.file_name)
  try 
  {
    //get installation paths from path manager
    const paths = await getActivePaths()
    
    if (paths.source === 'none') {
      return {
        success: false,
        message: 'no AE installation found. configure paths in settings.'
      }
    }

    onProgress?.({ downloaded: 0, total: 0, percentage: 0 }) //set progress bar to default stuff
    
    const fileData = await downloadFile(preset.file_url, onProgress)

    //save temp to downloads folder
    const downloadPath = await downloadDir()
    const tempPath = await join(downloadPath, preset.file_name)

    await invoke('write_binary_file', {
      path: tempPath,
      contents: Array.from(fileData)
    })

    const presetType = getPresetType(preset.file_name)
    
    const result = await invoke<string>('install_preset', 
    {
      presetType,
      fileName: preset.file_name,
      sourcePath: tempPath,
    })

    let installedPath: string | null
    if (presetType === 'script')
    {
      installedPath = paths.scriptsPath
    }
    else if (presetType === 'preset')
    {
      installedPath = paths.presetsPath
    }
    else
    {
      installedPath = paths.compositionPath
    }

    return {
      success: true,
      message: result,
      installedPath
    }

  } 
  catch (error) 
  {
    console.error('download/install error:', error)
    return {
      success: false,
      message: `failed to install: ${error}`
    }
  }
}

/**
 * just download without installing to AE (for preview/inspection)
 */
export async function downloadPreset(
  preset: Preset,
  onProgress?: (progress: DownloadProgress) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const fileData = await downloadFile(preset.file_url, onProgress)
    
    const downloadPath = await downloadDir()
    const filePath = await join(downloadPath, preset.file_name)

    
      await invoke('write_binary_file', {
      path: filePath,
      contents: Array.from(fileData)
    })

    return {
      success: true,
      path: filePath
    }
  } catch (error) {
    return {
      success: false,
      error: String(error)
    }
  }
}