import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import "./App.css"
import { ThemeProvider } from './components/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  // strictmode is causing the duplicate questions for interview prep 
  // apparently strictmode will not duplicate when the website is hosted
  // <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  // </StrictMode>
)
