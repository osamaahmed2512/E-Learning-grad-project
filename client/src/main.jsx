import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'animate.css' // for animation of AboutUs Page
import { Provider } from 'react-redux'
import store from './store/Store.js'


// Import Publishable Key (For Authentication)


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </Provider>
)