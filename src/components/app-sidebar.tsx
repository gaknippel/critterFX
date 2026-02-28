import { FileQuestionMark, Columns3Cog, Cog, Github } from "lucide-react"
import { Link } from "react-router-dom"
import { open } from '@tauri-apps/plugin-shell'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"

const items = [
  {
    title: "presets",
    url: "/",
    icon: Columns3Cog,
  },
  {
    title: "about",
    url: "/about",
    icon: FileQuestionMark, 
  },
  {
    title: "settings",
    url: "/settings",
    icon: Cog,
  },
]

export function AppSidebar() {
  const handleGithubClick = async () => {
    await open('https://github.com/gaknippel/critterFX')
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>welcome to critterFX!</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleGithubClick}>
              <Github />
              <span>view the source code!</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}