import './Settings.css'
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FolderOpen, CheckCircle, AlertCircle, Search, Monitor, Sun, Moon, Sparkles, Trees, Sunset, Loader2, Waves, Flower2, Zap } from 'lucide-react'
import SplitText from '@/components/SplitText';

import {
  scanAEInstallations,
  getPathConfig,
  savePathConfig,
  pickFolder,
  verifyPath,
  AEInstallation
} from '@/utils/aePathManager'

export default function Settings() {
  const {setTheme, theme} = useTheme();
  const [installations, setInstallations] = useState<AEInstallation[]>([]);
  const [customScriptsPath, setCustomScriptsPath] = useState('');
  const [customPresetsPath, setCustomPresetsPath] = useState('');
  const [customCompositionPath, setCustomCompositionPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scriptsPathValid, setScriptsPathValid] = useState<boolean | null>(null);
  const [presetsPathValid, setPresetsPathValid] = useState<boolean | null>(null);
  const [compositionPathValid, setCompositionPathValid] = useState<boolean | null>(null);


  useEffect(() => {
    window.scrollTo(0, 0);
    loadInitialData();
  }, []);

    const loadInitialData = async () => 
    {
    const config = await getPathConfig();
    if (config.custom_scripts_path) 
    {
      setCustomScriptsPath(config.custom_scripts_path);
      const valid = await verifyPath(config.custom_scripts_path);
      setScriptsPathValid(valid);
    }
    if (config.custom_presets_path) 
    {
      setCustomPresetsPath(config.custom_presets_path);
      const valid = await verifyPath(config.custom_presets_path);
      setPresetsPathValid(valid);
    }
    if (config.custom_composition_path)
    {
      setCustomCompositionPath(config.custom_composition_path);
      const valid = await verifyPath(config.custom_composition_path);
      setCompositionPathValid(valid);
    }


    await handleScan();
  };

 const handleScan = async () => {
    setIsScanning(true);
    try 
    {
      // Add a small artificial delay to make the scan feel more substantial
      await new Promise(resolve => setTimeout(resolve, 800));
      const found = await scanAEInstallations();
      setInstallations(found);
    } 
    catch (error) 
    {
      console.error('Failed to scan:', error);
    } 
    finally 
    {
      setIsScanning(false);
    }
  };

 const handleBrowseScripts = async () => {
    const folder = await pickFolder();
    if (folder) 
    {
      setCustomScriptsPath(folder);
      const valid = await verifyPath(folder);
      setScriptsPathValid(valid);
    }
  };

  const handleBrowsePresets = async () => {
  const folder = await pickFolder();
  if (folder) 
  {
    setCustomPresetsPath(folder);
    const valid = await verifyPath(folder);
    setPresetsPathValid(valid);
  }
};

const handleBrowseCompositions = async () => {
  const folder = await pickFolder();
  if(folder)
  {
    setCustomCompositionPath(folder);
    const valid = await verifyPath(folder);
    setCompositionPathValid(valid);
  }
}

 const handleSavePaths = async () => {
    try {
      await savePathConfig(
        customScriptsPath || undefined,
        customPresetsPath || undefined,
        customCompositionPath || undefined,
      );
      toast.success('paths saved successfully!');
    } catch (error) 
    {
      toast.error('failed to save paths');
    }
  };

  const handleUseDetectedPath = async (installation: AEInstallation) => {
    setCustomScriptsPath(installation.scripts_path);
    setCustomPresetsPath(installation.user_presets_path);

    const scriptsValid = await verifyPath(installation.scripts_path);
    const presetsValid = await verifyPath(installation.user_presets_path);
    
    setScriptsPathValid(scriptsValid);
    setPresetsPathValid(presetsValid);
  };
  
  return(
    <div className="settings-wrapper">
      <div className="settings-header-section">
        <div className="settings-header-content">
          <SplitText
            text="settings"
            className="settings-welcome-message"
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
          <p className="settings-header-description">
            configure your after effects paths and app appearance
          </p>
        </div>
      </div>

      {/* AE Paths Section */}
      <div className="settings-info-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">after effects paths</h2>
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            variant="outline"
            size="sm"
            className="settings-action-button"
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="mr-2 h-3.5 w-3.5" />
            )}
            {isScanning ? 'scanning...' : 'scan again'}
          </Button>
        </div>

        <div className="settings-section-content space-y-6">
          <div className="settings-detection-area border rounded-lg overflow-hidden bg-muted/10 relative">
            {/* detected installations or skeleton */}
            {isScanning ? (
              <div className="p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between gap-6 py-4 border-t border-border/50 first:border-t-0">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <Skeleton className="h-8 w-14 shrink-0 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ) : installations.length > 0 ? (
              <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">detected installations:</span>
                </div>
                <div className="space-y-3">
                  {installations.map((inst) => (
                    <div key={inst.version} className="flex items-center justify-between gap-4 py-2 border-t border-border/50 first:border-t-0">
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm">after effects {inst.version}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          scripts: {inst.scripts_path}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          presets: {inst.user_presets_path}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-4 text-xs w-fit shrink-0"
                        onClick={() => handleUseDetectedPath(inst)}
                      >
                        use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 h-full flex items-center gap-3 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">no after effects installations detected. set custom paths below.</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="settings-field">
              <div className="flex items-center gap-2">
                <Label className="settings-field-label">scripts folder</Label>
                {scriptsPathValid !== null && (
                  scriptsPathValid ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customScriptsPath}
                  onChange={(e) => setCustomScriptsPath(e.target.value)}
                  placeholder="C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\Scripts"
                  className={scriptsPathValid === false ? 'border-destructive/50' : ''}
                />
                <Button 
                  className="shrink-0 h-10 w-10 p-0" 
                  onClick={handleBrowseScripts} 
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="settings-field">
              <div className="flex items-center gap-2">
                <Label className="settings-field-label">user presets folder</Label>
                {presetsPathValid !== null && (
                  presetsPathValid ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customPresetsPath}
                  onChange={(e) => setCustomPresetsPath(e.target.value)}
                  placeholder="C:\Users\YourName\Documents\Adobe\After Effects\User Presets"
                  className={presetsPathValid === false ? 'border-destructive/50' : ''}
                />
                <Button 
                  className="shrink-0 h-10 w-10 p-0" 
                  onClick={handleBrowsePresets} 
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="settings-field">
              <div className="flex items-center gap-2">
                <Label className="settings-field-label">compositions folder (custom)</Label>
                {compositionPathValid !== null && (
                  compositionPathValid ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customCompositionPath}
                  onChange={(e) => setCustomCompositionPath(e.target.value)}
                  placeholder="C:\Users\YourName\Documents\critterFX\Compositions"
                  className={compositionPathValid === false ? 'border-destructive/50' : ''}
                />
                <Button 
                  className="shrink-0 h-10 w-10 p-0" 
                  onClick={handleBrowseCompositions} 
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* appearance section */}
      <div className="settings-info-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">appearance</h2>
        </div>
        <div className="settings-section-content">
          <div className="settings-field">
            <Label className="settings-field-label">app theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as any)} >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="select a theme" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="midnight">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>midnight</span>
                  </div>
                </SelectItem>
                <SelectItem value="forest">
                  <div className="flex items-center gap-2">
                    <Trees className="h-4 w-4 text-green-500" />
                    <span>forest</span>
                  </div>
                </SelectItem>
                <SelectItem value="sunset">
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-400" />
                    <span>sunset</span>
                  </div>
                </SelectItem>
                <SelectItem value="ocean">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-400" />
                    <span>ocean</span>
                  </div>
                </SelectItem>
                <SelectItem value="rose">
                  <div className="flex items-center gap-2">
                    <Flower2 className="h-4 w-4 text-rose-400" />
                    <span>rose</span>
                  </div>
                </SelectItem>
                <SelectItem value="nebula">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <span>nebula</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>system</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <Button className="settings-save-button" onClick={handleSavePaths}>
          save all changes
        </Button>
      </div>
    </div>
  )
}




