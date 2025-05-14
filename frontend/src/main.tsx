import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme, watchSystemThemeChanges } from './lib/theme-init'
import { Toaster } from 'react-hot-toast'

// Initialize theme before rendering to prevent flash of wrong theme
initializeTheme();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Wrap App with ThemeProvider
function AppWithThemeWatcher() {
  // Watch for system theme changes
  useEffect(() => {
    const unwatch = watchSystemThemeChanges();
    return unwatch;
  }, []);

  return (
    <>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #333)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#4F46E5',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

root.render(
  <StrictMode>
    <AppWithThemeWatcher />
  </StrictMode>,
)
