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

import SplitText from '../../components/SplitText'
import FadeContent from '@/components/FadeContent';



export default function Settings() {

    const { setTheme } = useTheme();
    const [updateMessage, setUpdateMessage] = useState('');

    const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

    return(
        <div className="settings-page-wrapper p-4 md:p-6">
        <FadeContent blur={false} duration={1000} easing="power2.out" initialOpacity={0} className='settings-welcome-message'>
        settings
        </FadeContent>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">appearance</h2>
          <div className="flex items-center justify-between">
            <span>theme</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">theme</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  dark
                </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setTheme("midnight")}>
                  midnight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("forest")}>
                  forest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("sunset")}>
                  sunset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  system
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            </section>
          </div>

        </div>
    )
}