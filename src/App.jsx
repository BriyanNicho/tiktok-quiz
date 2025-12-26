import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Overlay from './pages/Overlay'
import ControlPanel from './pages/ControlPanel'
import './index.css'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card-strong p-10 max-w-lg text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-cyan-400">TikTok</span> Live Quiz
        </h1>
        <p className="text-slate-400 mb-8">
          Aplikasi kuis interaktif untuk TikTok Live dengan papan peringkat Pintar & Sultan
        </p>

        <div className="flex flex-col gap-4">
          <Link to="/control" className="btn-primary text-center text-lg">
            🎮 Host Control Panel
          </Link>
          <Link to="/overlay" className="btn-secondary text-center text-lg">
            📺 Open Overlay (OBS)
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            💡 Gunakan Control Panel untuk mengelola kuis dan Overlay untuk tampilan di OBS/TikTok Live Studio
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/control" element={<ControlPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
