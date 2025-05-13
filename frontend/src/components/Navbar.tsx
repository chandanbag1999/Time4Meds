import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Container } from "./ui/container"
import { Button } from "./ui/button-modern"
import { ThemeToggle } from "./ui/theme-toggle"

interface NavbarProps {
  isMobile?: boolean
  isMenuOpen?: boolean
  toggleMenu?: () => void
}

export default function Navbar({ isMobile = false, isMenuOpen = false, toggleMenu }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/add-medicine", label: "Add Medicine" },
    { path: "/logs", label: "Reminder Logs" }
  ]

  const activeLink = (path: string) => 
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path))

  return (
    <nav className={cn(
      "transition-all duration-300 sticky top-0 z-50 w-screen",
      "dark:border-gray-800",
      isMobile 
        ? "bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900/30" 
        : "bg-white/80 backdrop-blur-md border-b border-gray-200/60 dark:bg-gray-900/90 dark:border-gray-800/60"
    )}>
      <Container className="py-3" size="full">
        <div className="flex items-center justify-between w-full">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <Link to="/dashboard" className="font-bold text-xl text-primary-500 dark:text-primary-400 mr-4">
              Time4Meds
            </Link>
            
            {isMobile && (
              <button 
                onClick={toggleMenu}
                className="p-2 -mr-2 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <ul className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={cn(
                      "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
                      activeLink(link.path)
                        ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-700"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          
          {/* User Menu (Desktop) */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Hello, {user.name || 'User'}
                </span>
              )}
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </Container>
      
      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden fixed top-[53px] left-0 w-screen h-auto bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-gray-900/30 z-50 animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "block px-3 py-3 rounded-md text-base font-medium",
                  activeLink(link.path)
                    ? "bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                )}
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-700 mt-2">
              {user && (
                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Logged in as <span className="font-semibold">{user.name || 'User'}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2">
                <ThemeToggle />
                <button
                  onClick={() => {
                    handleLogout();
                    if (toggleMenu) toggleMenu();
                  }}
                  className="text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 