import { Minus, Square, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './TitleBar.css'
import { useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export default function TitleBar() {
  const appWindow = getCurrentWindow()
  
  // Track history length (very basic detection)

  useEffect(() => {
    const handlePopState = () => {
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="titlebar">
      <div className="titlebar-navigation">
        <button 
          className="titlebar-btn titlebar-nav-btn" 
          onClick={() => window.history.back()}
          title="Go back"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          className="titlebar-btn titlebar-nav-btn" 
          onClick={() => window.history.forward()}
          title="Go forward"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="titlebar-drag-region" />
      <div className="titlebar-controls">
        <button className="titlebar-btn titlebar-minimize" onClick={() => appWindow.minimize()}>
          <Minus size={12} />
        </button>
        <button className="titlebar-btn titlebar-maximize" onClick={() => appWindow.toggleMaximize()}>
          <Square size={10} />
        </button>
        <button className="titlebar-btn titlebar-close" onClick={() => appWindow.close()}>
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
