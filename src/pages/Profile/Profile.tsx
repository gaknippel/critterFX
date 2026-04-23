import { useUserContext } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  MessageSquare,
  Package,
  LogOut,
  Camera,
  Download,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Type as TypeIcon,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image as ImageIcon,
  Code as CodeIcon,
  Layers,
} from 'lucide-react'
import './Profile.css'
import SplitText from '@/components/SplitText'
import { formatBytes, formatDate } from '@/lib/utils'
import { categories, type Preset } from '@/lib/api'
import { type Comment } from '@/lib/supabase'

const categoryIcons: Record<string, ReactNode> = {
  textAnims: <TypeIcon className="size-4" />,
  transitions: <MoveHorizontal className="size-4" />,
  shapeAnims: <Shapes className="size-4" />,
  effects: <Sparkles className="size-4" />,
  backgrounds: <ImageIcon className="size-4" />,
  scripts: <CodeIcon className="size-4" />,
  compositions: <Layers className="size-4" />,
}

export default function Profile() {
  const { user, signOut } = useUserContext()
  const navigate = useNavigate()
  const { id } = useParams()

  // if no id in url, we're viewing our own profile
  const isOwnProfile = !id || id === user?.username
  const profileId = isOwnProfile ? user?.id : null

  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [presetCount, setPresetCount] = useState(0)
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [profilePresets, setProfilePresets] = useState<Preset[]>([])
  const [profileComments, setProfileComments] = useState<(Comment & { presets: { name: string } | null })[]>([])
  const [profileUserId, setProfileUserId] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)
  const [editPresetOpen, setEditPresetOpen] = useState(false)
  const [deletePresetOpen, setDeletePresetOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLongDescription, setEditLongDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editDependencies, setEditDependencies] = useState('')
  const [editAeVersion, setEditAeVersion] = useState('')
  const [editPresetFile, setEditPresetFile] = useState<File | null>(null)
  const [editGifFile, setEditGifFile] = useState<File | null>(null)
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [isDeletingPreset, setIsDeletingPreset] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [gifDragOver, setGifDragOver] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [profileId])

  useEffect(() => {
    if (!editPresetOpen || !editingPreset) return

    setEditName(editingPreset.name)
    setEditDescription(editingPreset.description)
    setEditLongDescription(editingPreset.long_description || '')
    setEditCategory(editingPreset.category)
    setEditTags(editingPreset.tags?.join(', ') || '')
    setEditDependencies(editingPreset.dependencies?.join(', ') || '')
    setEditAeVersion(editingPreset.ae_version || '')
    setEditPresetFile(null)
    setEditGifFile(null)
  }, [editPresetOpen, editingPreset])

  const fetchProfileData = async () => {
    console.log('fetchProfileData called')
    if (!id && !user) return
    setIsLoading(true)

    if (isOwnProfile) {
      const { data: authData } = await supabase.auth.getUser()
      setEmail(authData.user?.email || '')
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, created_at, bio, avatar_url')
      .eq(isOwnProfile ? 'id' : 'username', isOwnProfile ? user!.id : id)
      .single<{ id: string; username: string; created_at: string; bio: string | null; avatar_url: string | null }>()

    if (profileData) {
      setUsername(profileData.username)
      setCreatedAt(profileData.created_at)
      setBio(profileData.bio || '')
      setAvatarUrl(profileData.avatar_url || '')
      setProfileUserId(profileData.id)

      const { count: cc } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
      setCommentCount(cc || 0)

      const { count: pc } = await supabase
        .from('presets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
      setPresetCount(pc || 0)
    }

    setIsLoading(false)
  }

  const handleSaveBio = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', user!.id)
    if (!error) setIsEditingBio(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('image is too large! max size is 2MB')
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url

    img.onload = async () => {
      URL.revokeObjectURL(url)

      if (img.width < 100 || img.height < 100) {
        toast.error('image is too small! minimum size is 100x100px')
        return
      }

      try {
        const avatarPath = `${user.id}/avatar`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(avatarPath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarPath)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError

        toast.success('avatar updated!')
        fetchProfileData()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  const fetchProfilePresets = async () => {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('user_id', profileUserId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('error fetching profile presets:', error)
      return
    }
    if (data) setProfilePresets(data)
  }

  const fetchProfileComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, presets(name)')
      .eq('user_id', profileUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('error fetching profile comments:', error)
      return
    }
    if (data) setProfileComments(data)
  }

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId)
    setEditingCommentText(currentText)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleSaveEdit = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ 
        content: editingCommentText,
        edited_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (error) {
      toast.error(error.message)
      return
    }

    // update local state 
    setProfileComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, content: editingCommentText, edited_at: new Date().toISOString() }
        : c
    ))

    setEditingCommentId(null)
    setEditingCommentText('')
    toast.success('comment updated!')
  }

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      toast.error(error.message)
      return
    }

    // remove the comment from local state so UI updates instantly
    setProfileComments(prev => prev.filter(c => c.id !== commentId))
    setCommentCount(prev => prev - 1)
    toast.success('comment deleted!')
  }

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset)
    setEditPresetOpen(true)
  }

  const handleAskDeletePreset = (preset: Preset) => {
    setEditingPreset(preset)
    setDeletePresetOpen(true)
  }

  const handlePresetFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['ffx', 'jsx', 'aep'].includes(ext || '')) {
      toast.error('invalid file type! only .ffx, .jsx, and .aep files are allowed.')
      return
    }
    setEditPresetFile(file)
  }

  const handlePresetDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePresetFileChange(file)
  }

  const handleGifDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setGifDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (file.type !== 'image/gif') {
      toast.error('preview must be a GIF!')
      return
    }

    setEditGifFile(file)
  }

  const handleSavePreset = async () => {
    if (!editingPreset || !user) return
    setIsSavingPreset(true)

    try {
      let fileUrl = editingPreset.file_url
      let fileName = editingPreset.file_name
      let fileSize = editingPreset.file_size
      let gifUrl = editingPreset.preview_gif_url

      if (editPresetFile) {
        const oldPath = editingPreset.file_url.split('/preset-files/')[1]
        if (oldPath) {
          await supabase.storage.from('preset-files').remove([oldPath])
        }

        const newPath = `${user.id}/${Date.now()}_${editPresetFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('preset-files')
          .upload(newPath, editPresetFile)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('preset-files').getPublicUrl(newPath)
        fileUrl = urlData.publicUrl
        fileName = editPresetFile.name
        fileSize = formatBytes(editPresetFile.size)
      }

      if (editGifFile) {
        if (editGifFile.type !== 'image/gif') {
          throw new Error('preview must be a GIF!')
        }

        const oldGifPath = editingPreset.preview_gif_url?.split('/preset-previews/')[1]
        if (oldGifPath) {
          await supabase.storage.from('preset-previews').remove([oldGifPath])
        }

        const newGifPath = `${user.id}/${Date.now()}_${editGifFile.name}`
        const { error: gifUploadError } = await supabase.storage
          .from('preset-previews')
          .upload(newGifPath, editGifFile)
        if (gifUploadError) throw gifUploadError

        const { data: gifUrlData } = supabase.storage.from('preset-previews').getPublicUrl(newGifPath)
        gifUrl = gifUrlData.publicUrl
      }

      const updates = {
        name: editName,
        description: editDescription,
        long_description: editLongDescription,
        category: editCategory,
        ae_version: editAeVersion,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        dependencies: editDependencies.split(',').map(d => d.trim()).filter(Boolean),
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        preview_gif_url: gifUrl,
      }

      const { error } = await supabase
        .from('presets')
        .update(updates)
        .eq('id', editingPreset.id)

      if (error) throw error

      setProfilePresets(prev =>
        prev.map(preset =>
          preset.id === editingPreset.id
            ? {
                ...preset,
                ...updates,
                previewGif: gifUrl,
                fileName,
                aeVersion: editAeVersion,
              }
            : preset
        )
      )

      toast.success('preset updated!')
      setEditPresetOpen(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleDeletePreset = async () => {
    if (!editingPreset || !user) return
    setIsDeletingPreset(true)

    try {
      const filePath = editingPreset.file_url.split('/preset-files/')[1]
      if (filePath) {
        await supabase.storage.from('preset-files').remove([filePath])
      }

      const gifPath = editingPreset.preview_gif_url?.split('/preset-previews/')[1]
      if (gifPath) {
        await supabase.storage.from('preset-previews').remove([gifPath])
      }

      const { error } = await supabase
        .from('presets')
        .delete()
        .eq('id', editingPreset.id)

      if (error) throw error

      setProfilePresets(prev => prev.filter(preset => preset.id !== editingPreset.id))
      setPresetCount(prev => prev - 1)
      setDeletePresetOpen(false)
      toast.success('preset deleted!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsDeletingPreset(false)
    }
  }

  if (isLoading) {
    return (
      <div className="profile-wrapper" style={{ scrollbarGutter: 'stable' }}>
        <div className="profile-header">
          <Skeleton className="profile-avatar" />
          <div className="profile-header-info">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="profile-info-section">
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="profile-stats">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`profile-wrapper${isEditingBio ? ' profile-wrapper-editing' : ''}`}
      style={{ scrollbarGutter: 'stable' }}
    >
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-letter">{username[0]?.toUpperCase()}</span>
            )}
          </div>
          {/* only show avatar upload on own profile */}
          {isOwnProfile && (
            <>
              <input
                id="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="profile-avatar-input"
                onChange={handleAvatarUpload}
              />
              <label className="profile-avatar-upload" htmlFor="avatar-input">
                <Camera size={14} />
                <span>change avatar</span>
              </label>
            </>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-username">{username}</h1>
          {/* only show email on own profile */}
          {isOwnProfile && <p className="profile-email">{email}</p>}
          <p className="profile-joined">
            <Calendar size={12} className="inline mr-1" />
            joined {createdAt ? formatDate(createdAt) : '...'}
          </p>
        </div>

        {/* only show sign out on own profile */}
        {isOwnProfile && (
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="profile-signout profile-action-button profile-signout-button"
          >
            <LogOut size={16} className="mr-2" />
            sign out
          </Button>
        )}
      </div>

      <div className="profile-info-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">bio</h2>
          {/* only show edit button on own profile */}
          {isOwnProfile && !isEditingBio && (
            <Button
              variant="ghost"
              size="icon"
              className="profile-action-button comment-action-btn"
              onClick={() => setIsEditingBio(true)}
              title="Edit bio"
            >
              <Pencil size={14} />
            </Button>
          )}
          {isOwnProfile && isEditingBio && (
            <div className="profile-bio-actions">
              <Button
                variant="ghost"
                size="icon"
                className="profile-action-button comment-action-btn"
                onClick={() => setIsEditingBio(false)}
                title="Cancel"
              >
                <X size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="profile-action-button comment-action-btn"
                onClick={handleSaveBio}
                title="Save"
              >
                <Check size={14} />
              </Button>
            </div>
          )}
        </div>
        <div className="profile-bio-content">
          {isOwnProfile && isEditingBio ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="tell the community about yourself..."
              className="profile-bio-textarea"
            />
          ) : bio ? (
            <p className="profile-bio-text">{bio}</p>
          ) : (
            <p className="profile-bio-empty">
              {isOwnProfile ? 'no bio yet.' : 'this user has no bio yet.'}
            </p>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <Card 
          className={`profile-stat-card clickable-stat border-border/50 bg-card/50 backdrop-blur-sm transition-all ${showPresets ? 'ring-2 ring-primary border-primary/50' : ''}`}
          onClick={() => {
            if (!showPresets) {
              fetchProfilePresets()
            }
            setShowPresets(!showPresets)
            setShowComments(false)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-1">
            <Package size={24} className={`profile-stat-icon transition-colors ${showPresets ? 'text-primary' : 'text-primary/80'}`} />
            <span className="profile-stat-value text-2xl font-bold">{presetCount}</span>
            <span className="profile-stat-label text-xs uppercase tracking-wider text-muted-foreground font-medium">presets</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`profile-stat-card clickable-stat border-border/50 bg-card/50 backdrop-blur-sm transition-all ${showComments ? 'ring-2 ring-primary border-primary/50' : ''}`}
          onClick={() => {
            if (!showComments) {
              fetchProfileComments()
            }
            setShowComments(!showComments)
            setShowPresets(false)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-1">
            <MessageSquare size={24} className={`profile-stat-icon transition-colors ${showComments ? 'text-primary' : 'text-primary/80'}`} />
            <span className="profile-stat-value text-2xl font-bold">{commentCount}</span>
            <span className="profile-stat-label text-xs uppercase tracking-wider text-muted-foreground font-medium">comments</span>
          </CardContent>
        </Card>
      </div>

      {showPresets && (
        <div className="profile-presets-section">
          <h2 className="profile-section-title mb-4">presets</h2>
          {profilePresets.length === 0 ? (
            <p className="profile-bio-empty text-center py-8">no presets yet.</p>
          ) : (
            <div className="profile-presets-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profilePresets.map(preset => (
                <Card
                  key={preset.id}
                  className="preset-card cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-card/40"
                  onClick={() => navigate(`/preset/${preset.id}`)}
                >
                  <div className="aspect-video relative bg-muted overflow-hidden">
                    <img 
                      src={preset.preview_gif_url} 
                      alt={preset.name} 
                      className="object-cover w-full h-full"
                      loading="lazy" 
                    />
                    <div className="preset-download-badge">
                      <Download size={12} />
                      <span>{preset.download_count}</span>
                    </div>
                    {isOwnProfile && (
                      <div className="comment-actions preset-card-actions" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="comment-action-btn"
                          onClick={() => handleEditPreset(preset)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="comment-action-btn comment-action-btn-danger"
                          onClick={() => handleAskDeletePreset(preset)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base font-semibold truncate">{preset.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{preset.description}</CardDescription>
                      <p className="preset-date mt-2">{formatDate(preset.created_at)}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showComments && (
        <div className="profile-presets-section">
          <h2 className="profile-section-title mb-4">comments</h2>
          {profileComments.length === 0 ? (
            <p className="profile-bio-empty text-center py-8">no comments yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {profileComments.map(comment => (
                <Card 
                  key={comment.id} 
                  className={`bg-card/40 border-border/40 transition-colors ${editingCommentId === comment.id ? '' : 'cursor-pointer hover:bg-card/60'}`} 
                  onClick={() => {
                    if (editingCommentId !== comment.id) {
                      navigate(`/preset/${comment.preset_id}`)
                    }
                  }}
                >
                  <CardContent className="p-4 relative">
                    <div className="flex justify-between items-start mb-2 pr-16">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-primary">{comment.presets?.name || 'unknown preset'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(comment.created_at)}
                          {comment.edited_at && <span className="ml-1 italic">(edited)</span>}
                        </span>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <div className="comment-actions absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                        {editingCommentId === comment.id ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="comment-action-btn"
                              onClick={handleCancelEdit}
                              title="Cancel"
                            >
                              <X size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="comment-action-btn"
                              onClick={() => handleSaveEdit(comment.id)}
                              title="Save"
                            >
                              <Check size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="comment-action-btn"
                              onClick={() => handleEditComment(comment.id, comment.content)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="comment-action-btn comment-action-btn-danger"
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {editingCommentId === comment.id ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="min-h-[80px] mt-2"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={deletePresetOpen} onOpenChange={setDeletePresetOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
          <Card className="upload-card border-none shadow-2xl">
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
              <div className="upload-form">
                <div className="upload-field">
                  <Label>what gets deleted:</Label>
                  <div className="upload-dropzone has-file cursor-default" style={{ padding: '1.5rem', textAlign: 'left' }}>
                    <div className="upload-file-info">
                      <p className="upload-file-name">{editingPreset?.file_name}</p>
                      <p className="upload-file-size">everything will be gone!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <DialogFooter className="p-6 pt-0 flex gap-2 sm:justify-end">
              <Button variant="ghost" onClick={() => setDeletePresetOpen(false)} className="preset-cancel-btn">
                cancel
              </Button>
              <Button onClick={handleDeletePreset} disabled={isDeletingPreset} className="upload-submit-btn min-w-[120px]">
                {isDeletingPreset ? (
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

      <Dialog open={editPresetOpen} onOpenChange={setEditPresetOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
          <Card className="upload-card border-none shadow-2xl">
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
              <div className="upload-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="upload-field">
                    <Label htmlFor="edit-name">preset name</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="preset name"
                    />
                  </div>

                  <div className="upload-field">
                    <Label htmlFor="edit-category">category</Label>
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger id="edit-category" className="w-full category-select">
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

                <div className="upload-field">
                  <Label htmlFor="edit-description">short description</Label>
                  <Input
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="short description"
                  />
                </div>

                <div className="upload-field">
                  <Label htmlFor="edit-long-description">long description</Label>
                  <Textarea
                    id="edit-long-description"
                    value={editLongDescription}
                    onChange={(e) => setEditLongDescription(e.target.value)}
                    placeholder="detailed description..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="upload-field">
                  <Label htmlFor="edit-ae-version">after effects version</Label>
                  <Input
                    id="edit-ae-version"
                    value={editAeVersion}
                    onChange={(e) => setEditAeVersion(e.target.value)}
                    placeholder="2023 or later"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="upload-field">
                    <Label htmlFor="edit-tags">tags <span className="upload-hint">(comma separated)</span></Label>
                    <Input
                      id="edit-tags"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="animation, text, smooth"
                    />
                  </div>

                  <div className="upload-field">
                    <Label htmlFor="edit-dependencies">dependencies <span className="upload-hint">(comma separated)</span></Label>
                    <Input
                      id="edit-dependencies"
                      value={editDependencies}
                      onChange={(e) => setEditDependencies(e.target.value)}
                      placeholder="none"
                    />
                  </div>
                </div>

                <div className="upload-field">
                  <Label>preset file <span className="upload-hint">(leave empty to keep current: {editingPreset?.file_name})</span></Label>
                  <div
                    className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file' : ''}`}
                    onDrop={handlePresetDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById('edit-preset-file-input')?.click()}
                    style={{ padding: '2rem' }}
                  >
                    <input
                      id="edit-preset-file-input"
                      type="file"
                      accept=".ffx,.jsx,.aep"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && handlePresetFileChange(e.target.files[0])}
                    />
                    {editPresetFile ? (
                      <div className="upload-file-info">
                        <p className="upload-file-name">{editPresetFile.name}</p>
                        <p className="upload-file-size">{formatBytes(editPresetFile.size)}</p>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop your preset here</p>
                        <p className="upload-dropzone-sub">or click to browse - .ffx, .jsx, .aep</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="upload-field">
                  <Label>preview gif <span className="upload-hint">(leave empty to keep current)</span></Label>
                  <div
                    className={`upload-dropzone ${gifDragOver ? 'dragover' : ''} ${editGifFile ? 'has-file' : ''}`}
                    onDrop={handleGifDrop}
                    onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                    onDragLeave={() => setGifDragOver(false)}
                    onClick={() => document.getElementById('edit-gif-file-input')?.click()}
                    style={{ padding: '2rem' }}
                  >
                    <input
                      id="edit-gif-file-input"
                      type="file"
                      accept="image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && setEditGifFile(e.target.files[0])}
                    />
                    {editGifFile ? (
                      <div className="upload-file-info">
                        <p className="upload-file-name">{editGifFile.name}</p>
                        <p className="upload-file-size">{formatBytes(editGifFile.size)}</p>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop preview gif here</p>
                        <p className="upload-dropzone-sub">or click to browse - .gif only</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <DialogFooter className="p-6 pt-0 flex gap-2 sm:justify-end">
              <Button variant="ghost" onClick={() => setEditPresetOpen(false)} className="preset-cancel-btn">
                cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={isSavingPreset} className="upload-submit-btn min-w-[120px]">
                {isSavingPreset ? (
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
    </div>
  )
}
