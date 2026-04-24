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
              your preset will be gone forever! obviously do this at your will.
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

  const handlePresetDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onPresetFileChange(file)
  }

  const handleGifSelection = (file: File) => {
    if (file.type !== 'image/gif') {
      toast.error('preview must be a GIF!')
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
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none"
      >
        <Card className="preset-manage-card border-none shadow-2xl">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="preset-manage-close"
              aria-label="Close edit preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <CardHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">
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
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              edit your preset. leave things unchanged to keep original data.
            </DialogDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="preset-manage-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="preset-manage-field">
                  <Label htmlFor="edit-name">preset name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="preset name"
                  />
                </div>

                <div className="preset-manage-field">
                  <Label htmlFor="edit-category">category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-category" className="w-full">
                      <SelectValue placeholder="select a category" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {categories.filter((category) => category.id !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {categoryIcons[category.id]}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="preset-manage-field">
                <Label htmlFor="edit-description">short description</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="short description"
                />
              </div>

              <div className="preset-manage-field">
                <Label htmlFor="edit-long-description">long description</Label>
                <Textarea
                  id="edit-long-description"
                  value={editLongDescription}
                  onChange={(e) => setEditLongDescription(e.target.value)}
                  placeholder="detailed description..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="preset-manage-field">
                <Label htmlFor="edit-ae-version">after effects version</Label>
                <Input
                  id="edit-ae-version"
                  value={editAeVersion}
                  onChange={(e) => setEditAeVersion(e.target.value)}
                  placeholder="2023 or later"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="preset-manage-field">
                  <Label htmlFor="edit-tags">
                    tags <span className="preset-manage-hint">(comma separated)</span>
                  </Label>
                  <Input
                    id="edit-tags"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="animation, text, smooth"
                  />
                </div>

                <div className="preset-manage-field">
                  <Label htmlFor="edit-dependencies">
                    dependencies <span className="preset-manage-hint">(comma separated)</span>
                  </Label>
                  <Input
                    id="edit-dependencies"
                    value={editDependencies}
                    onChange={(e) => setEditDependencies(e.target.value)}
                    placeholder="none"
                  />
                </div>
              </div>

              <div className="preset-manage-field">
                <Label>
                  preset file{' '}
                  <span className="preset-manage-hint">(leave empty to keep current: {preset?.file_name})</span>
                </Label>
                <div
                  className={`preset-manage-dropzone ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file' : ''}`}
                  onDrop={handlePresetDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById(presetInputId)?.click()}
                  style={{ padding: '2rem' }}
                >
                  <input
                    id={presetInputId}
                    type="file"
                    accept=".ffx,.jsx,.aep"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && onPresetFileChange(e.target.files[0])}
                  />
                  {editPresetFile ? (
                    <div className="preset-manage-file-info">
                      <p className="preset-manage-file-name">{editPresetFile.name}</p>
                      <p className="preset-manage-file-size">{formatBytes(editPresetFile.size)}</p>
                    </div>
                  ) : (
                    <div className="preset-manage-dropzone-prompt">
                      <p>drag & drop your preset here</p>
                      <p className="preset-manage-dropzone-sub">or click to browse - .ffx, .jsx, .aep</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="preset-manage-field">
                <Label>
                  preview gif <span className="preset-manage-hint">(leave empty to keep current)</span>
                </Label>
                <div
                  className={`preset-manage-dropzone ${gifDragOver ? 'dragover' : ''} ${editGifFile ? 'has-file' : ''}`}
                  onDrop={handleGifDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setGifDragOver(true)
                  }}
                  onDragLeave={() => setGifDragOver(false)}
                  onClick={() => document.getElementById(gifInputId)?.click()}
                  style={{ padding: '2rem' }}
                >
                  <input
                    id={gifInputId}
                    type="file"
                    accept="image/gif"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleGifSelection(e.target.files[0])}
                  />
                  {editGifFile ? (
                    <div className="preset-manage-file-info">
                      <p className="preset-manage-file-name">{editGifFile.name}</p>
                      <p className="preset-manage-file-size">{formatBytes(editGifFile.size)}</p>
                    </div>
                  ) : (
                    <div className="preset-manage-dropzone-prompt">
                      <p>drag & drop preview gif here</p>
                      <p className="preset-manage-dropzone-sub">or click to browse - .gif only</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <DialogFooter className="preset-manage-footer p-6 pt-0">
            <Button onClick={onSave} disabled={isSaving} className="preset-manage-submit min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  save changes
                </>
              )}
            </Button>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
