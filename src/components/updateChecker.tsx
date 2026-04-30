import { useEffect, useState } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { toast } from 'sonner'
import { ArrowUpCircle, RefreshCw } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateVersion, setUpdateVersion] = useState('?.?.?')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    checkForUpdates()
  }, [])

  const checkForUpdates = async () => {
    try {
      const update = await check()
      console.log('Update check result:', update)
      if (update) {
        setUpdateAvailable(true)
        setUpdateVersion(update.version)
      } else {
        // Only hide if we explicitly checked and found nothing
        // setUpdateAvailable(false) 
        // For now, let's keep it true so the user can see it's there
      }
    } catch (error) {
      console.error('Update check failed:', error)
    }
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const update = await check()
      if (update) {
        await update.downloadAndInstall()
        await relaunch()
      }
    } catch (error) {
      console.error('Full update error:', error)
      toast.error(`Update failed: ${JSON.stringify(error)}`)
      setIsUpdating(false)
    }
  }

  if (!updateAvailable) return null

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`footer-status update-available ${isUpdating ? 'updating' : ''}`}
            onClick={handleUpdate}
            disabled={isUpdating}
            aria-label="update available"
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '0 0.8rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
          >
            {isUpdating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-[10px] font-bold tracking-tight">UPDATING...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle size={14} />
                <span className="text-[10px] font-bold tracking-tight">UPDATE AVAILABLE</span>
              </>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px] font-medium py-1 px-2">
          {isUpdating ? 'Installing update...' : `update v${updateVersion} available - click to install`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}