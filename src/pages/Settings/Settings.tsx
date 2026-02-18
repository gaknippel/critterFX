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
  }, []);
  




}


