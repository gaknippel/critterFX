import { createBrowserRouter } from 'react-router-dom'
import App from './App'  
import Presets from './pages/Presets/Presets'
import About from './pages/About/About'
import Settings from './pages/Settings/Settings'
import PresetDetail from './pages/PresetDetail/PresetDetail';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Presets />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'preset/:id',
        element: <PresetDetail />,
      },
    ],
  },
])

export default router