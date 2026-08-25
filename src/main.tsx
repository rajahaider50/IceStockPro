import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TutorialProvider } from './tutorial/TutorialContext'
import { ALL_TUTORIAL_STEPS } from './tutorial/tutorialSteps'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TutorialProvider allSteps={ALL_TUTORIAL_STEPS}>
      <App />
    </TutorialProvider>
  </StrictMode>,
)
