export interface Preset { //preset data as an interface
  id: number
  name: string
  category: string
  previewGif: string
  description: string
  longDescription?: string
  dependencies?: string[]
  aeVersion?: string
  fileSize?: string
  author?: string
  tags?: string[]
}


export const presets: Preset[] = [
  {   
    id: 1,
    name: 'animated content',
    category: 'text',
    previewGif: '/previews/animated-content.gif',
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
    previewGif: '/previews/animated-list.gif',
    description: 'components',
    longDescription: 'Animated list component with staggered entrance animations.',
    dependencies: ['None'],
    aeVersion: '2022 or later',
    fileSize: '1.8 MB',
    author: 'Your Name',
    tags: ['list', 'components']
  },
  {
    id: 3,
    name: 'antigravity',
    category: 'particles',
    previewGif: '/previews/antigravity.gif',
    description: 'animations',
    longDescription: 'Creates floating particle effects that defy gravity.',
    dependencies: ['Particular plugin'],
    aeVersion: '2023 or later',
    fileSize: '4.1 MB',
    author: 'Your Name',
    tags: ['particles', 'effects', 'gravity']
  },
  {
    id: 4,
    name: 'ASCII text',
    category: 'text',
    previewGif: '/previews/ascii-text.gif',
    description: 'text animations',
    longDescription: 'Transform text into ASCII art with animated glitch effects.',
    dependencies: ['None'],
    aeVersion: '2022 or later',
    fileSize: '1.5 MB',
    author: 'Your Name',
    tags: ['text', 'ascii', 'glitch']
  },
  {
    id: 5,
    name: 'sticker animation script',
    category: 'scripts',
    previewGif: '/previews/stickerscript.gif',
    description: 'stickers covering screen!',
    longDescription: 'creates a dynamic sticker aninmation that covers the screen with customizable properties.',
    dependencies: ['none'],
    aeVersion: '2023 or later',
    fileSize: '3.2 MB',
    author: 'critterfarts',
    tags: ['script', 'stickers', 'effects', 'fun', 'steamhappy']
  },
]

export const categories = [
  { id: 'all', name: 'all presets' },
  { id: 'text', name: 'text animations' },
  { id: 'transitions', name: 'transitions' },
  { id: 'shapes', name: 'shape animations' },
  { id: 'particles', name: 'effects' },
  { id: 'backgrounds', name: 'backgrounds' },
  { id: 'scripts', name: 'scripts' },
]


