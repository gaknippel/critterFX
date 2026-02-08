import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import "./App.css";


export default function App() {

  return (
    <div className='select-none'>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SidebarTrigger />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
    </ThemeProvider>
    </div>
    
  )
}
