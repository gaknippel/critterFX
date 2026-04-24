import { useState } from 'react'
import './About.css'
import SplitText from '@/components/SplitText'
import { 
  Code2, 
  Heart, 
  Terminal,
  Cpu,
  Globe,
  Database,
  Wrench,
  User,
  Settings
} from 'lucide-react'

export default function About() {
  const [activeTab, setActiveTab] = useState<'user' | 'dev'>('user')

  return (
    <div className="about-wrapper pb-10">
      {/* Header Section */}
      <div className="about-header">
        <div className="about-header-info">
          <SplitText
            text="about critterFX:"
            className="about-title"
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
          <p className="about-subtitle">v1.0.0</p>
        </div>
      </div>

      <div className="flex gap-4 mb-2">
        <button 
          className={`about-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          <User size={18} /> user guide
        </button>
        <button 
          className={`about-tab-btn ${activeTab === 'dev' ? 'active' : ''}`}
          onClick={() => setActiveTab('dev')}
        >
          <Code2 size={18} /> dev docs
        </button>
      </div>

      {activeTab === 'user' ? (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2">
                <Heart size={18} /> my goal...
              </h2>
            </div>
            <div className="about-content mt-4">
              <p className="about-description">
                basically free shit for cool people who edit in AE. We want to provide a fast, reliable, and entirely open-source platform for sharing and downloading After Effects presets.
              </p>
            </div>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <Cpu size={24} className="mb-2 text-primary/80" />
              <h3>its fast!</h3>
              <p>native performance with rust</p>
            </div>
            <div className="about-feature-card">
              <Globe size={24} className="mb-2 text-primary/80" />
              <h3>its free!</h3>
              <p>I LOVE FREE STUFF! :D</p>
            </div>
            <div className="about-feature-card">
              <Heart size={24} className="mb-2 text-primary/80" />
              <h3>open source</h3>
              <p>made for the community!</p>
            </div>
          </div>

          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2">how to Use</h2>
              <p className="text-sm text-muted-foreground mt-1">its simple :D</p>
            </div>
            <div className="about-content mt-2 space-y-4 text-sm text-muted-foreground">
              <p>
                1. <strong>browse presets:</strong> head over to the preset page to find presets shared by the community.
              </p>
              <p>
                2. <strong>download & apply:</strong> click download on any preset. they will be saved to your configured AE preset folder automatically!
              </p>
              <p>
                3. <strong>share your own:</strong> go to the upload tab to share your creations with the community.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="about-stats">
            <div className="about-stat-card">
              <Terminal size={20} className="about-stat-icon" />
              <span className="about-stat-value">tauri</span>
              <span className="about-stat-label">rust backend</span>
            </div>
            <div className="about-stat-card">
              <Code2 size={20} className="about-stat-icon" />
              <span className="about-stat-value">react</span>
              <span className="about-stat-label">typescript + tailwind</span>
            </div>
            <div className="about-stat-card">
              <Database size={20} className="about-stat-icon" />
              <span className="about-stat-value">supabase</span>
              <span className="about-stat-label">database & auth</span>
            </div>
            <div className="about-stat-card">
              <Wrench size={20} className="about-stat-icon" />
              <span className="about-stat-value">shadcn</span>
              <span className="about-stat-label">ui components</span>
            </div>
          </div>

          <div className="about-info-section">
            <div className="about-section-header">
              <h2 className="about-section-title flex items-center gap-2"><Settings className="w-5 h-5"/> Setup Guide</h2>
              <p className="text-sm text-muted-foreground mt-1">everything you need to get critterFX running locally.</p>
            </div>
            <div className="about-content mt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">1. install prerequisites</h3>
                <div className="text-sm text-muted-foreground">
                  <p>you need node.js and rust installed on your system.</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>node.js:</strong> download from <a href="https://nodejs.org/" target="_blank" rel="noreferrer" className="text-primary hover:underline">nodejs.org</a></li>
                    <li><strong>rust:</strong> run the following in your terminal or download from <a href="https://rustup.rs/" target="_blank" rel="noreferrer" className="text-primary hover:underline">rustup.rs</a>
                      <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                        <code>curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
                      </pre>
                    </li>
                    <li><strong>tauri CLI dependencies:</strong> check the <a href="https://v2.tauri.app/start/prerequisites/" target="_blank" rel="noreferrer" className="text-primary hover:underline">tauri prereqs guide</a> for OS-specific requirements.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">2. supabase setup</h3>
                <div className="text-sm text-muted-foreground">
                  <p>we use supabase for authentication and data storage.</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>create a project at <a href="https://supabase.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">supabase.com</a></li>
                    <li>set up an authentication provider (email/password or discord/google).</li>
                    <li>create the necessary tables (presets, users, etc.) in the SQL editor.</li>
                    <li>create a storage bucket for preset files.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">3. API keys & environment variables</h3>
                <div className="text-sm text-muted-foreground">
                  <p>create a <code>.env</code> file in the root of the project and add your supabase keys:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>
VITE_SUPABASE_URL=your_project_url{'\n'}
VITE_SUPABASE_ANON_KEY=your_anon_key
                    </code>
                  </pre>
                  <p className="mt-2 text-xs italic">note: Never commit your <code>.env</code> file!</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">4. run the project</h3>
                <div className="text-sm text-muted-foreground">
                  <p>install frontend dependencies and start the tauri dev server:</p>
                  <pre className="bg-muted text-foreground p-3 rounded-md mt-2 overflow-x-auto font-mono text-xs border border-border/50">
                    <code>
npm install{'\n'}
npm run tauri dev
                    </code>
                  </pre>
                  <p className="mt-2">this will start the vite dev server and open the tauri desktop window.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="about-footer mt-auto">
        <p>made by crittercast</p>
      </div>
    </div>
  )
}
