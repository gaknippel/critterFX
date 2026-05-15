import { useId, type DragEvent, type ReactNode } from 'react'
import {
  Check,
  Code as CodeIcon,
  Image as ImageIcon,
  Layers,
  Loader2,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { categories, type Preset } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import SplitText from '@/components/SplitText'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react';

import '../../pages/Settings/Settings.css'
import '../../pages/Upload/Upload.css'
import './PresetManagementDialogs.css'

const categoryIcons: Record<string, ReactNode> = {
  textAnims: <TypeIcon className="size-4" />,
  transitions: <MoveHorizontal className="size-4" />,
  shapeAnims: <Shapes className="size-4" />,
  effects: <Sparkles className="size-4" />,
  backgrounds: <ImageIcon className="size-4" />,
  scripts: <CodeIcon className="size-4" />,
  compositions: <Layers className="size-4" />,
}

type PresetDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset: Preset | null
  onDelete: () => void
  isDeleting: boolean
}

type PresetEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset: Preset | null
  editName: string
  setEditName: (value: string) => void
  editDescription: string
  setEditDescription: (value: string) => void
  editLongDescription: string
  setEditLongDescription: (value: string) => void
  editCategory: string
  setEditCategory: (value: string) => void
  editTags: string
  setEditTags: (value: string) => void
  editDependencies: string
  setEditDependencies: (value: string) => void
  editAeVersion: string
  setEditAeVersion: (value: string) => void
  editPresetFile: File | null
  onPresetFileChange: (file: File) => void
  editGifFile: File | null
  onGifFileChange: (file: File) => void
  dragOver: boolean
  setDragOver: (value: boolean) => void
  gifDragOver: boolean
  setGifDragOver: (value: boolean) => void
  onSave: () => void
  isSaving: boolean
}

export function PresetDeleteDialog({
  open,
  onOpenChange,
  preset,
  onDelete,
  isDeleting,
}: PresetDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none"
      >
        <Card className="preset-manage-card border-none shadow-2xl">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="preset-manage-close"
              aria-label="Close delete preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <CardHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">
              <SplitText
                text="delete preset"
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
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              your preset will be gone forever! obviously do this at your own will.
            </DialogDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="preset-manage-form">
              <div className="preset-manage-field">
                <Label>what gets deleted:</Label>
                <div
                  className="preset-manage-dropzone has-file cursor-default"
                  style={{ padding: '1.5rem', textAlign: 'left' }}
                >
                  <div className="preset-manage-file-info">
                    <p className="preset-manage-file-name">{preset?.file_name}</p>
                    <p className="preset-manage-file-size">everything will be gone!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <DialogFooter className="preset-manage-footer p-6 pt-0">
            <Button onClick={onDelete} disabled={isDeleting} className="preset-manage-submit min-w-[120px]">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  delete preset
                </>
              )}
            </Button>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export function PresetEditDialog({
  open,
  onOpenChange,
  preset,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editLongDescription,
  setEditLongDescription,
  editCategory,
  setEditCategory,
  editTags,
  setEditTags,
  editDependencies,
  setEditDependencies,
  editAeVersion,
  setEditAeVersion,
  editPresetFile,
  onPresetFileChange,
  editGifFile,
  onGifFileChange,
  dragOver,
  setDragOver,
  gifDragOver,
  setGifDragOver,
  onSave,
  isSaving,
}: PresetEditDialogProps) {
  const presetInputId = useId()
  const gifInputId = useId()

  const [gifPreviewUrl, setGifPreviewUrl] = useState<string | null>(null)

  // Initialize preview URL if a gif file is already passed in (e.g. from an aborted edit)
  // or clean up when closed.
  useEffect(() => {
    if (editGifFile) {
      const url = URL.createObjectURL(editGifFile)
      setGifPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setGifPreviewUrl(null)
    }
  }, [editGifFile])

  const handlePresetDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('preset file too large! max size is 3MB.')
        return
      }
      onPresetFileChange(file)
    }
  }

  const handleGifSelection = (file: File) => {
    if (file.type !== 'image/gif') {
      toast.error('preview must be a GIF!')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('gif preview too large! max size is 2MB.')
      return
    }

    onGifFileChange(file)
  }

  const handleGifDrop = (e: DragEvent) => {
    e.preventDefault()
    setGifDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleGifSelection(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none custom-scrollbar"
      >
        <div className="settings-wrapper w-full p-4 md:p-8 bg-background/95 backdrop-blur-xl rounded-xl border">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full z-10"
              aria-label="Close edit preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <div className="settings-header-section !bg-transparent !border-none !shadow-none !p-0 !mb-2">
            <div className="settings-header-content">
              <DialogTitle asChild>
                <h1 className="settings-welcome-message text-2xl font-bold">
                  <SplitText
                    text="edit preset"
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
                </h1>
              </DialogTitle>
              <DialogDescription className="settings-header-description mt-2 text-muted-foreground">
                edit your preset. leave files unchanged to keep original data.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            
            {/* Files Section */}
            <div className="settings-info-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">files</h2>
              </div>
              <div className="settings-section-content space-y-4">
                
                {/* preset dropzone */}
                <div className="settings-field">
                  <Label className="settings-field-label">
                    preset file{' '}
                    <span className="text-muted-foreground font-normal normal-case ml-1">(leave empty to keep current: {preset?.file_name})</span>
                  </Label>
                  <div
                    className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file' : ''}`}
                    onDrop={handlePresetDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById(presetInputId)?.click()}
                  >
                    <input
                      id={presetInputId}
                      type="file"
                      accept=".ffx,.jsx,.aep"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            toast.error('preset file too large! max size is 3MB.')
                            return
                          }
                          onPresetFileChange(file)
                        }
                      }}
                    />
                    {editPresetFile ? (
                      <div className="upload-file-info">
                        <p className="upload-file-name">{editPresetFile.name}</p>
                        <p className="upload-file-size">{formatBytes(editPresetFile.size)}</p>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop your preset here</p>
                        <p className="upload-dropzone-sub">or click to browse — .ffx, .jsx, .aep (max 3MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* gif dropzone */}
                <div className="settings-field">
                  <Label className="settings-field-label">
                    preview gif{' '}
                    <span className="text-muted-foreground font-normal normal-case ml-1">(leave empty to keep current)</span>
                  </Label>
                  <div
                    className={`upload-dropzone relative overflow-hidden ${gifDragOver ? 'dragover' : ''} ${editGifFile ? 'has-file border-none p-0' : 'p-8'}`}
                    onDrop={handleGifDrop}
                    onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                    onDragLeave={() => setGifDragOver(false)}
                    onClick={() => document.getElementById(gifInputId)?.click()}
                  >
                    <input
                      id={gifInputId}
                      type="file"
                      accept="image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && handleGifSelection(e.target.files[0])}
                    />
                    {gifPreviewUrl ? (
                      <div className="relative w-full h-full min-h-[160px] group rounded-xl overflow-hidden">
                        <img 
                          src={gifPreviewUrl} 
                          alt="GIF Preview" 
                          className="w-full h-full object-scale-down absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <p className="text-white font-medium text-sm">click to change preview</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-start pointer-events-none">
                          <p className="text-white font-semibold text-sm truncate w-full text-left">{editGifFile?.name}</p>
                          <p className="text-white/80 text-xs">{editGifFile && formatBytes(editGifFile.size)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop preview gif here</p>
                        <p className="upload-dropzone-sub">or click to browse — .gif only (max 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="settings-info-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">details</h2>
              </div>
              <div className="settings-section-content space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-name">preset name</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="my cool preset" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-category">category</Label>
                    <Select value={editCategory} onValueChange={setEditCategory} required>
                      <SelectTrigger id="edit-category" className="w-full h-10">
                        <SelectValue placeholder="select a category" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              {categoryIcons[c.id]}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-description">short description</Label>
                  <Input id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required placeholder="a short one-liner" />
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-long-description">long description</Label>
                  <Textarea
                    id="edit-long-description"
                    value={editLongDescription}
                    onChange={(e) => setEditLongDescription(e.target.value)}
                    placeholder="detailed instructions, tips, how to use, etc."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-ae-version">after effects version</Label>
                  <Input id="edit-ae-version" value={editAeVersion} onChange={(e) => setEditAeVersion(e.target.value)} placeholder="2023 or later" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-tags">tags <span className="upload-hint normal-case font-normal">(comma separated)</span></Label>
                    <Input id="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="animation, text, smooth" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-dependencies">dependencies <span className="upload-hint normal-case font-normal">(comma separated)</span></Label>
                    <Input id="edit-dependencies" value={editDependencies} onChange={(e) => setEditDependencies(e.target.value)} placeholder="none" />
                  </div>
                </div>

              </div>
            </div>

            <div className="settings-footer !p-0 !bg-transparent !border-none !shadow-none">
              <Button 
                onClick={onSave} 
                disabled={isSaving} 
                className="settings-save-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
