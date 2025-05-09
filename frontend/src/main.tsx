import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'
import { store } from './store'
import './index.css'
import { AppRouter } from './routes'

// Get Clerk publishable key from environment variable
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!publishableKey) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </ClerkProvider>
  </StrictMode>,
)
