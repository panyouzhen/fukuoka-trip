import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { isUnlocked } from './lib/gate'
import { Gate } from './components/Gate'
import { Shell } from './components/Shell'
import { Overview } from './pages/Overview'
import { DayDetail } from './pages/DayDetail'
import { Candidates } from './pages/Candidates'
import { Wishlist } from './pages/Wishlist'
import { Todos } from './pages/Todos'

function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked())

  if (!unlocked) {
    return <Gate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Overview />} />
        <Route path="/day/:dayId?" element={<DayDetail />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/todos" element={<Todos />} />
      </Route>
    </Routes>
  )
}

export default App
