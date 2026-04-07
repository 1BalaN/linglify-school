import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'
import { ThemeProvider } from '@/shared/lib/theme'
import { SocketProvider } from '@/shared/lib'
import App from '@/app/App'
import { AppErrorBoundary } from '@/shared/ui'
import '@/shared/i18n/config'
import '@/app/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <SocketProvider>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
