import './Home.css'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

// Sample data structure - replace with your actual presets
const categories = [
  { id: 'all', name: 'all presets' },
  { id: 'text', name: 'text animations' },
  { id: 'transitions', name: 'transitions' },
  { id: 'shapes', name: 'shape animations' },
  { id: 'particles', name: 'particles & effects' },
  { id: 'backgrounds', name: 'backgrounds' },
]

const presets = [
  {
    id: 1,
    name: 'animated content',
    category: 'text',
    previewGif: '/path/to/preview1.gif',
    description: 'text animations'
  },
  {
    id: 2,
    name: 'animated list',
    category: 'text',
    previewGif: '/path/to/preview2.gif',
    description: 'components'
  },
  {
    id: 3,
    name: 'antigravity',
    category: 'particles',
    previewGif: '/path/to/preview3.gif',
    description: 'animations'
  },
  {
    id: 4,
    name: 'ASCII text',
    category: 'text',
    previewGif: '/path/to/preview4.gif',
    description: 'text animations'
  },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPresets = presets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="home-page-wrapper">
      <div className="home-header">
        <h1 className="home-title">preset browser</h1>
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="home-content-layout">
        {/* Categories Sidebar */}
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

        {/* Presets Grid */}
        <main className="presets-main">
          <ScrollArea className="presets-scroll">
            <div className="presets-grid">
              {filteredPresets.map((preset) => (
                <div key={preset.id} className="preset-card">
                  <div className="preset-preview">
                    {/* Replace with actual GIF preview */}
                    <div className="preview-placeholder">
                      <span>preview</span>
                    </div>
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
      </div>
    </div>
  )
}