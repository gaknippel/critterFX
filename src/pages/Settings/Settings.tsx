import './Settings.css'
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from '@/components/theme-provider';
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { FolderOpen, CheckCircle, AlertCircle, Search } from 'lucide-react'
import FadeContent from '@/components/FadeContent';

import {
  scanAEInstallations,
  getPathConfig,
  savePathConfig,
  pickFolder,
  verifyPath,
  AEInstallation
} from '@/utils/aePathManager'

export default function Settings() {
  const {setTheme} = useTheme();
  const [installations, setInstallations] = useState<AEInstallation[]>([]);
  const [customScriptsPath, setCustomScriptsPath] = useState('');
  const [customPresetsPath, setCustomPresetsPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scriptsPathValid, setScriptsPathValid] = useState<boolean | null>(null);
  const [presetsPathValid, setPresetsPathValid] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState('');


  useEffect(() => {
    loadInitialData();
  }, []); // useEffect runs when page is loaded. the [] mean to only run once per launch.

    const loadInitialData = async () => 
    {
    // load saved custom paths
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


    await handleScan();
  };

 const handleScan = async () => {
    setIsScanning(true);
    try 
    {
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

 const handleSavePaths = async () => {
    try {
      await savePathConfig(
        customScriptsPath || undefined,
        customPresetsPath || undefined
      );
      setSaveMessage('Paths saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) 
    {
      setSaveMessage('Failed to save paths');
      setTimeout(() => setSaveMessage(''), 3000);
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
       <div className="settings-page-wrapper p-4 md:p-6">
      <FadeContent blur={false} duration={1000} easing="power2.out" initialOpacity={0} className='settings-welcome-message'>
        settings
      </FadeContent>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Appearance Section */}
        <section className="settings-section">
          <h2 className="text-xl font-semibold mb-2">appearance</h2>
          <div className="flex items-center justify-between">
            <span>theme</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">theme</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("midnight")}>midnight</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("forest")}>forest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("sunset")}>sunset</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>system</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

       <section className="settings-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">after effects paths</h2>
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              variant="outline"
              size="sm"
            >
              <Search className="mr-2 h-4 w-4" />
              {isScanning ? 'scanning...' : 'scan again'}
            </Button>
          </div>


         {/* Detected Installations */}
          {installations.length > 0 && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">detected installations:</div>
                {installations.map((inst) => (
                  <div key={inst.version} className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <div className="font-medium">After Effects {inst.version}</div>
                      <div className="text-xs text-muted-foreground">
                        Scripts: {inst.scripts_path}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Presets: {inst.user_presets_path}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleUseDetectedPath(inst)}
                    >
                      use this
                    </Button>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {installations.length === 0 && !isScanning && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                no after effects installations detected. set custom paths below.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">scripts folder</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={customScriptsPath}
                  onChange={(e) => setCustomScriptsPath(e.target.value)}
                  placeholder="C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\Scripts"
                  className={scriptsPathValid === false ? 'border-destructive' : ''}
                />
                {scriptsPathValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {scriptsPathValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <Button onClick={handleBrowseScripts} variant="outline">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">user presets folder</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={customPresetsPath}
                  onChange={(e) => setCustomPresetsPath(e.target.value)}
                  placeholder="C:\Users\YourName\Documents\Adobe\After Effects\User Presets"
                  className={presetsPathValid === false ? 'border-destructive' : ''}
                />
                {presetsPathValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {presetsPathValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <Button onClick={handleBrowsePresets} variant="outline">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSavePaths}>
              save paths
            </Button>
            {saveMessage && (
              <span className="text-sm text-muted-foreground">{saveMessage}</span>
            )}
          </div>
        </section>

      </div>
    </div>

    
  )



}


