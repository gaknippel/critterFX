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

  const handleUseDetectedPath = (installation: AEInstallation) => {
    setCustomScriptsPath(installation.scripts_path);
    setCustomPresetsPath(installation.user_presets_path);
    setScriptsPathValid(true);
    setPresetsPathValid(true);
  };
  
  return(
       <div className="settings-page-wrapper p-4 md:p-6">
      <FadeContent blur={false} duration={1000} easing="power2.out" initialOpacity={0} className='settings-welcome-message'>
        settings
      </FadeContent>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Appearance Section */}
        <section className="settings-section">
          <h2 className="text-xl font-semibold mb-4">appearance</h2>
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
      </div>
    </div>
  )



}


