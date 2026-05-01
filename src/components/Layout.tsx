import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { Footer } from './Footer'
import TitleBar from './titlebar'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TitleBar />
      <NavBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}