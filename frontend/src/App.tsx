import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Layout and Components
import ResponsiveLayout from './components/ResponsiveLayout'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import AddMedicine from './pages/AddMedicine'
import EditMedicine from './pages/EditMedicine'
import Logs from './pages/Logs'
import ReminderLogs from './pages/ReminderLogs'
import NotFound from './pages/NotFound'

// New Feature Pages
import AdherenceAnalytics from './pages/AdherenceAnalytics'
import InventoryManagement from './pages/InventoryManagement'
import CaregiverSettings from './pages/CaregiverSettings'
import ComponentTest from './pages/ComponentTest'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/test" element={<ComponentTest />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<ResponsiveLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-medicine" element={<AddMedicine />} />
                  <Route path="/edit-medicine/:id" element={<EditMedicine />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/logs/:id" element={<Logs />} />
                  <Route path="/reminder-logs" element={<ReminderLogs />} />

                  {/* New Feature Routes */}
                  <Route path="/analytics" element={<AdherenceAnalytics />} />
                  <Route path="/inventory" element={<InventoryManagement />} />
                  <Route path="/caregivers" element={<CaregiverSettings />} />
                  <Route path="/component-test" element={<ComponentTest />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
