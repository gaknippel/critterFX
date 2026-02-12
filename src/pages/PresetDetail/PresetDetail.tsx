import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Info, Package, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import './PresetDetail.css'

// This should match your presets data from Home.tsx
// In a real app, you'd import this from a shared file
const presets = [
  {
    id: 1,
    name: 'animated content',
    category: 'text',
    previewGif: '/path/to',
    description: 'text animations',
    longDescription: 'This preset creates smooth, professional text animations with customizable timing and easing options. Perfect for titles, lower thirds, and any text-based content.',
    dependencies: ['None'],
    aeVersion: '2023 or later',
    fileSize: '2.4 MB',
    author: 'Your Name',
    tags: ['text', 'animation', 'titles']
  },
  {
    id: 2,
    name: 'animated list',
    category: 'text',
    previewGif: '/path/to/preview2.gif',
    description: 'components',
    longDescription: 'Animated list component with staggered entrance animations.',
    dependencies: ['None'],
    aeVersion: '2022 or later',
    fileSize: '1.8 MB',
    author: 'Your Name',
    tags: ['list', 'components']
  },
  {
    id: 5,
    name: 'sticker animation script',
    category: 'scripts',
    previewGif: '/previews/stickerscript.gif',
    description: 'stickers covering screen!',
    longDescription: 'Creates a dynamic sticker animation effect that covers your composition with customizable stickers.',
    dependencies: ['None'],
    aeVersion: '2023 or later',
    fileSize: '3.2 MB',
    author: 'Your Name',
    tags: ['script', 'stickers', 'effects']
  },
]

export default function PresetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Find the preset by ID
  const preset = presets.find(p => p.id === parseInt(id || '0'))

  // If preset not found, show error
  if (!preset) {
    return (
      <div className="preset-detail-wrapper">
        <div className="preset-not-found">
          <h1>Preset not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2" />
            Back to Browser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="preset-detail-wrapper">
      {/* Header with back button */}
      <div className="preset-detail-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="back-button"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Browser
        </Button>
      </div>

      {/* Main content */}
      <div className="preset-detail-content">
        {/* Left side - Preview */}
        <div className="preset-preview-section">
          <div className="preset-preview-large">
            <img 
              src={preset.previewGif} 
              alt={preset.name}
            />
          </div>
          <Button className="download-button" size="lg">
            <Download className="mr-2" />
            Download Preset
          </Button>
        </div>

        {/* Right side - Details */}
        <div className="preset-details-section">
          <div className="preset-header-info">
            <h1 className="preset-detail-title">{preset.name}</h1>
            <p className="preset-detail-category">{preset.category}</p>
          </div>

          <div className="preset-tags">
            {preset.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {/* Description */}
          <div className="detail-section">
            <div className="section-header">
              <Info size={20} />
              <h2>Description</h2>
            </div>
            <p className="detail-text">{preset.longDescription || preset.description}</p>
          </div>

          {/* Technical Info */}
          <div className="detail-section">
            <div className="section-header">
              <FileCode size={20} />
              <h2>Technical Information</h2>
            </div>
            <div className="tech-info-grid">
              <div className="tech-info-item">
                <span className="tech-label">After Effects Version:</span>
                <span className="tech-value">{preset.aeVersion}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">File Size:</span>
                <span className="tech-value">{preset.fileSize}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">Author:</span>
                <span className="tech-value">{preset.author}</span>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="detail-section">
            <div className="section-header">
              <Package size={20} />
              <h2>Dependencies</h2>
            </div>
            <ul className="dependencies-list">
              {preset.dependencies?.map((dep, index) => (
                <li key={index}>{dep}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}