import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './App.css'
import { UserProvider } from './context/UserContext'
import { Toaster } from './components/ui/sonner'

export default function App() {
  return (
    <UserProvider>
      <div className="app-content">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </UserProvider>
  )
}