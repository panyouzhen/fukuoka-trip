import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// GitHub Pages 是純靜態伺服器，沒有 server-side rewrite，
// 用 HashRouter（網址會長 /#/day/xxx）才能讓重新整理不會 404。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
