import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './App.css'
import { UserProvider } from './context/UserContext'
import { Toaster } from './components/ui/sonner'
import TitleBar from './components/titlebar'

export default function App() {
  return (
    <UserProvider>
      <TitleBar />
      <div className="app-content">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </UserProvider>
  )
}