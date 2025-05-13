import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme, watchSystemThemeChanges } from './lib/theme-init'

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

  return <App />;
}

root.render(
  <StrictMode>
    <AppWithThemeWatcher />
  </StrictMode>,
)
