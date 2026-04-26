import { Github, Coffee, Mail, Wifi, WifiOff } from "lucide-react"
import "./Footer.css"
import { useEffect, useState } from "react"
import { getVersion } from "@tauri-apps/api/app"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  const [version, setVersion] = useState<string>("")
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  useEffect(() => {
    getVersion().then(setVersion)

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
    const interval = setInterval(checkStatus, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Links & Status */}
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
