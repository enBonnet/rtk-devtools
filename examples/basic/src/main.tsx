import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RTKDevtools } from '@rtk-devtools/react'
import { store } from './store'
import { api } from './api'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <RTKDevtools api={api} store={store} />
    </Provider>
  </StrictMode>,
)
