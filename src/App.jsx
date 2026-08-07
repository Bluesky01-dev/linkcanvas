import { Routes, Route } from 'react-router-dom'
import Bio from './pages/Bio.jsx'
import Editor from './pages/Editor.jsx'
import Stats from './pages/Stats.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Bio />} />
      <Route path="/edit" element={<Editor />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  )
}
