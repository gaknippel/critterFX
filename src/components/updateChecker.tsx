import { useEffect, useState } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { toast } from 'sonner'
import { Button } from './ui/button'

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateVersion, setUpdateVersion] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    checkForUpdates()
  }, [])

  const checkForUpdates = async () => {
    try {
      const update = await check()
      if (update?.available) {
        setUpdateAvailable(true)
        setUpdateVersion(update.version)
      }
    } catch (error) {
      console.error('failed to check for updates:', error)
    }
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const update = await check()
      if (update?.available) {
        await update.downloadAndInstall()
        await relaunch()
      }
    } catch (error: any) {
      toast.error(`update failed: ${error.message}`)
      setIsUpdating(false)
    }
  }

  if (!updateAvailable) return null

  return (
    <div className="update-banner">
      <p className="update-text">
        🎉 critterFX <strong>v{updateVersion}</strong> is available!
      </p>
      <Button
        size="sm"
        className="update-btn"
        onClick={handleUpdate}
        disabled={isUpdating}
      >
        {isUpdating ? 'updating...' : 'update now'}
      </Button>
    </div>
  )
}