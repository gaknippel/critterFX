import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { invoke } from '@tauri-apps/api/core'
import { X } from 'lucide-react'
import SplitText from '@/components/SplitText'
import './FirstLaunchDialogue.css'

interface PathConfig {
  custom_scripts_path?: string
  custom_presets_path?: string
  custom_composition_path?: string
}

interface AEInstallation {
  version: string
  scripts_path: string
  user_presets_path: string
  exists: boolean
}

export default function FirstLaunchDialog() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkFirstLaunch()
  }, [])

  const checkFirstLaunch = async () => {
    try {
      console.log('checking first launch conditions...')
      // check if custom paths are configured
      const config = await invoke<PathConfig>('get_path_config')
      console.log('config:', config)


      const hasCustomPaths = 
        config.custom_scripts_path || 
        config.custom_presets_path || 
        config.custom_composition_path

      console.log('has custom paths:', hasCustomPaths)

      if (hasCustomPaths) return  // already configured dont show

      // check if AE is auto detected
      const installations = await invoke<AEInstallation[]>('scan_ae_installations')
      console.log('detected AE installations:', installations)

      if (installations.length === 0) {
        // no config and no AE found show the dialog
        console.log('showing first launch dialoge')
        setOpen(true)
      }
    } catch (error) {
      console.error('first launch check failed:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="first-launch-dialog p-0 border-none bg-transparent shadow-none">
        <Card className="first-launch-card shadow-2xl" style={{ padding: '2rem' }}>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="first-launch-close"
              aria-label="Close dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>
          <div className="first-launch-form">
            <div className="first-launch-field">
              <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                <SplitText
                  text="welcome to critterFX!"
                  delay={20}
                  duration={1.5}
                  ease="elastic.out(1, 0.3)"
                  splitType="chars"
                  from={{ opacity: 0, y: 5 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="left"
                />
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                we couldn't find an after effects installation on your system. you'll need to configure your AE paths before installing presets.
              </DialogDescription>
            </div>

            <div className="first-launch-field">
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                head to settings to set up your after effects paths so critterFX knows where to install presets!
              </p>
            </div>

            <div className="first-launch-footer">
              <Button variant="ghost" className="first-launch-cancel" onClick={() => setOpen(false)}>
                later
              </Button>
              <Button className="first-launch-submit" onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}>
                open settings
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
