import { Github, Coffee, Mail, Wifi, WifiOff, Telescope } from "lucide-react"
import "./Footer.css"
import { useEffect, useState } from "react"
import { getVersion } from "@tauri-apps/api/app"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import UpdateChecker from "./updateChecker"
import {invoke} from "@tauri-apps/api/core"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export function Footer() {
  const [version, setVersion] = useState<string>("")
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [aeStatus, setAeStatus] = useState<'found' | 'not_found' | 'checking'>('checking')

  const checkAE = async () => {
    try{
      const installations = await invoke<any[]>('scan_ae_installations')
      const config = await invoke<any>('get_path_config')
      const hasCustomPaths = config.custom_scripts_path || config.custom_presets_path
      setAeStatus(installations.length > 0 || hasCustomPaths ? 'found' : 'not_found')

    }
    catch{
      setAeStatus('not_found')
    }
  }

  useEffect(() => {
    getVersion().then(setVersion)
    checkAE()

    const checkStatus = async () => {
      try {
        // simple check
        const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1)
        setIsOnline(!error)
      } catch {
        setIsOnline(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // check every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* links and status */}
        <div className="footer-links">
          <a
            href="https://github.com/gaknippel/critterFX"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://ko-fi.com/crittercast"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            aria-label="Support on Ko-fi"
          >
            <Coffee size={18} />
          </a>
          <a
            href="mailto:crittercast@proton.me"
            className="footer-link"
            aria-label="Contact via Email"
          >
            <Mail size={18} />
          </a>
        </div>

        {/* version & status */}
        <div className="footer-right">
          <UpdateChecker />
          
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`footer-status ${isOnline === true ? 'online' : isOnline === false ? 'offline' : 'checking'}`}>
                  {isOnline === false ? <WifiOff size={14} /> : <Wifi size={14} />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] font-medium py-1 px-2">
                {isOnline === true ? 'supabase API online' : isOnline === false ? 'supabase offline' : 'checking connection...'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`footer-status ${aeStatus === 'found' ? 'online' : aeStatus === 'not_found' ? 'offline' : 'checking'}`}>
                  <Telescope size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] font-medium py-1 px-2">
                {aeStatus === 'found' ? 'after effects detected' : aeStatus === 'not_found' ? 'after effects not found — check settings' : 'checking...'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {version && (
            <Badge variant="outline" className="version-badge">
              v{version}
            </Badge>
          )}
        </div>
      </div>
    </footer>
  )
}
