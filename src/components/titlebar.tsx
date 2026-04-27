import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Square, X } from 'lucide-react'
import './TitleBar.css'

export default function TitleBar() {
  const appWindow = getCurrentWindow()

  return (
    <div className="titlebar">
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