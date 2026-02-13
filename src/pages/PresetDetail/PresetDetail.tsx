import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Info, Package, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import './PresetDetail.css'
import { presets } from '@/data/presets'  // import shared data file

export default function PresetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // find the preset by ID from the shared data
  const preset = presets.find(p => p.id === parseInt(id || '0'))

  // error
  if (!preset) {
    return (
      <div className="preset-detail-wrapper">
        <div className="preset-not-found">
          <h1>preset not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2" />
            back to browser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="preset-detail-wrapper">
      <div className="preset-detail-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="back-button"
        >
          <ArrowLeft className="mr-2" size={20} />
          back to browser
        </Button>
      </div>

      {/* main content */}
      <div className="preset-detail-content">
        {/* left side */}
        <div className="preset-preview-section">
          <div className="preset-preview-large">
            <img 
              src={preset.previewGif} 
              alt={preset.name}
            />
          </div>
          <Button className="download-button" size="lg">
            <Download className="mr-2" />
            download preset
          </Button>
        </div>

        {/* right side */}
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

          {/* description */}
          <div className="detail-section">
            <div className="section-header">
              <Info size={20} />
              <h2>description</h2>
            </div>
            <p className="detail-text">{preset.longDescription || preset.description}</p>
          </div>

          {/* technical info */}
          <div className="detail-section">
            <div className="section-header">
              <FileCode size={20} />
              <h2>technical info</h2>
            </div>
            <div className="tech-info-grid">
              <div className="tech-info-item">
                <span className="tech-label">after effects version:</span>
                <span className="tech-value">{preset.aeVersion || 'N/A'}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">file size:</span>
                <span className="tech-value">{preset.fileSize || 'N/A'}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">author:</span>
                <span className="tech-value">{preset.author || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* dependencies */}
          <div className="detail-section">
            <div className="section-header">
              <Package size={20} />
              <h2>plug-ins needed:</h2>
            </div>
            <ul className="dependencies-list">
              {preset.dependencies?.map((dep, index) => (
                <li key={index}>{dep}</li>
              )) || <li>no dependencies</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}