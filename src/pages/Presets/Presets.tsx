import './Presets.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import FadeContent from '@/components/FadeContent'
import { presets, categories } from '@/data/presets'  // ←shared data file

export default function Presets() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const filteredPresets = presets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePresetClick = (presetId: number) => {
    navigate(`/preset/${presetId}`)
  }

  return (
    <div className="home-page-wrapper">
      <div className="home-header">
        <FadeContent blur={false} duration={1000} easing="power2.out" initialOpacity={0} className='home-title'>
        preset browser
        </FadeContent>
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="home-content-layout">
        <aside className="categories-sidebar">
          <h2 className="sidebar-title">categories</h2>
          <ScrollArea className="categories-scroll">
            <nav className="categories-nav">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* presets grid */}
        <FadeContent blur={false} duration={1000} easing="power2.out" initialOpacity={0} className='presets-main'>
        <main className="presets-main">
          <ScrollArea className="presets-scroll">
            <div className="presets-grid">
              {filteredPresets.map((preset) => (
                <div 
                  key={preset.id} 
                  className="preset-card"
                  onClick={() => handlePresetClick(preset.id)}
                >
                  <div className="preset-preview">
                      <img 
                        src={preset.previewGif} 
                        alt={preset.name}
                        loading="lazy"
                      />
                  </div>
                  <div className="preset-info">
                    <h3 className="preset-name">{preset.name}</h3>
                    <p className="preset-description">{preset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </main>
        </FadeContent>
      </div>
    </div>
  )
}