import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Info, Package, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { toast } from "sonner"
import './PresetDetail.css'
import { fetchPresets, type Preset } from '@/data/presets'
import { downloadAndInstall, type DownloadProgress } from '@/utils/presetDownloader'

export default function PresetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [preset, setPreset] = useState<Preset | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

  // load preset data
  useEffect(() => {
    loadPreset()
  }, [id])

  const loadPreset = async () => {
    const presets = await fetchPresets()
    const found = presets.find(p => p.id === parseInt(id || '0'))
    setPreset(found || null)
  }

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

  const handleDownload = async () => {
    setIsInstalling(true)
    setDownloadProgress({ downloaded: 0, total: 100, percentage: 0 })

    try 
    {
      const result = await downloadAndInstall(
        preset,
        (progress) => setDownloadProgress(progress)
      )

      if (result.success) 
      {
        toast.success("success!", {
          description: result.message,
        })
      } 
      else 
      {
        toast.error("installation failed", {
          description: result.message,
        })
      }
    } 
    catch (error) 
    {
      toast.error("error", {
        description: `failed to install preset: ${error}`,
      })
    } finally {
      setIsInstalling(false)
      setDownloadProgress(null)
    }
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

      <div className="preset-detail-content">
        <div className="preset-preview-section">
          <div className="preset-preview-large">
            <img 
              src={preset.previewGif} 
              alt={preset.name}
            />
          </div>
          
          {/* download progress */}
          {downloadProgress && (
            <div className="mb-4">
              <Progress value={downloadProgress.percentage} />
              <p className="text-sm text-center mt-2 text-muted-foreground">
                {downloadProgress.percentage}% - downloading...
              </p>
            </div>
          )}

          <Button 
            className="download-button" 
            size="lg"
            onClick={handleDownload}
            disabled={isInstalling}
          >
            <Download className="mr-2" />
            {isInstalling ? 'Installing...' : 'install to AE'}
          </Button>

          {preset.fileSize && (
            <p className="text-sm text-center mt-2 text-muted-foreground">
              file size: {preset.fileSize}
            </p>
          )}
        </div>

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

          <div className="detail-section">
            <div className="section-header">
              <Info size={20} />
              <h2>description</h2>
            </div>
            <p className="detail-text">{preset.longDescription || preset.description}</p>
          </div>

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

          <div className="detail-section">
            <div className="section-header">
              <Package size={20} />
              <h2>dependencies</h2>
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