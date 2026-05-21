# <img src="public/critterFX.png" width="45" align="top" alt="critterFX Logo" /> critterFX 

critterFX is a free preset manager for Adobe After Effects, with the main gimmick being that everyone can share their own effects, scripts, and project files (compositions)

## UPCOMING FEATURES

- **MACOS support!!**: i dont have a macbook so idk :(
- **LINUX support!!**: who uses AE on linux 😭
- **custom css themes!**: upload and use your own custom css themes to the app!
- **plug-in hub!**: tired of not having those plug-in dependencies? use a secret method 👀 of obtaining them with this hub!
- **much more stuff**: just wait :D

## features

- **automated installation**: one-click install for `.ffx` presets, `.jsx` scripts, and `.aep` compositions into your AE folders.
- **preset browser**: search and filter through categories to find presets to your liking!
- **for the people**: share your own presets, leave comments, and favorite the ones you like.
- **source code viewer**: inspect JSX script code directly within the app before installing.
- **different themes**: apply cool themes to the app if you think the original one is boring!
- **multi-version support**: detects your installed After Effects versions to for compatibility.
- **profiles**: create your own profile for other people to see!
- **easy-updates**: update the app without ever having to visit this repo again through my update system!

## getting started

### prerequisites

- [node.js](https://nodejs.org/) (latest LTS)
- [rust](https://www.rust-lang.org/) (for tauri)
- [after effects](https://www.adobe.com) (from adobe or from other secret ways 👀)

### supabase setup

i use supabase for authentication and data storage.

- create a project at [supabase.com](https://supabase.com/)
- set up an authentication provider (email/password or discord/google).
- create the necessary tables (presets, users, etc.) in the SQL editor.
- create a storage bucket for preset files (and pfp images/other stuff if you want).

### api keys & environment variables

create a `.env` file in the root of the project and add your supabase keys:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
make sure to NOT commit this file.

### local building

1. clone this repo:
   ```bash
   git clone https://github.com/gaknippel/critterFX.git
   cd critterFX
   ```

2. install dependencies:
   ```bash
   npm install
   ```

3. run in dev mode:
   ```bash
   npm run tauri dev
   ```

4. build for production:
   ```bash
   npm run tauri build
   ```

## interfaces

### preset interface

```typescript
interface Preset {
  id: string
  created_at: string
  user_id: string
  author_name: string
  name: string
  description: string
  category: string
  file_name: string
  file_url: string
  preview_gif_url?: string
  ae_version?: string
  download_count: number
  is_approved: boolean
  is_featured: boolean
}
```

### comment interface

```typescript
type Comment = {
  id: string
  created_at: string
  preset_id: string
  user_id: string
  author_name: string
  content: string
  edited_at?: string | null
}
```

i suggest looking at `api.ts` in `/src/lib` to get more information.

## backend architecture

the backend is built with rust using tauri, handling the file system management and executing elevated commands.

### core structures in `src-tauri/src/main.rs`

- **`AEInstallation`**: stores information about a detected after effects installation, including the version year, the path to its scripts folder, the path to its user presets folder, and a boolean flag indicating if it exists on the system.
- **`PathConfig`**: manages user-defined custom paths for scripts, presets, and compositions. this is stored locally in `path_config.json` within the app data directory. this is what you change in the settings.

### tauri commands exposed to frontend

- **`scan_ae_installations`**: automatically scans the system (checking standard installation paths for versions 2020 through 2025) to find valid after effects script and user preset directories.
- **`get_path_config` / `save_path_config`**: reads from and writes to the local `path_config.json` file, allowing users to override the default installation paths.
- **`verify_path`**: a utility command to check if a provided directory path actually exists on the filesystem.
- **`install_preset`**: the main command for installing downloaded assets. it dynamically determines the correct destination based on the preset type ("script", "preset", or "composition") and the user's path configuration. it automatically creates missing directories.
- **`write_binary_file`**: allows the frontend to write raw byte arrays to temporary files before they are installed.

### privilege escalation (windows)

installing `.jsx` scripts often requires writing to the `C:\Program Files` directory, which requires administrator privileges on windows. the backend handles this gracefully:
1. `install_preset` first attempts a standard file copy.
2. if it fails due to permission errors, it falls back to a custom `request_admin_and_copy` function.
3. this function spawns a hidden powershell process using `-Verb RunAs` to prompt the user for UAC (User Account Control) elevation and performs the copy with admin rights.

## stack

- **frontend**: react, typescript, vite, tailwind (for base layers), lucide react, shadcnui, reactbits
- **Backend**: rust (tauri)
- **Database/Auth**: supabase
- **some animations**: GSAP / custom CSS

## license

distributed under the MIT License. See `LICENSE` for more information.

---

*made with :3 by greyson.*
