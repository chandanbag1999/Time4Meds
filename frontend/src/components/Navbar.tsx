import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Container } from "./ui/container"
import { Button } from "./ui/button-modern"
import { ThemeToggle } from "./ui/theme-toggle"
import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/ThemeContext"

interface NavbarProps {
  isMobile?: boolean
  isMenuOpen?: boolean
  toggleMenu?: () => void
}

export default function Navbar({ isMobile = false, isMenuOpen = false, toggleMenu }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navLinks = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: "/add-medicine",
      label: "Add Med",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      path: "/logs",
      label: "History",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: "/caregivers",
      label: "Caregivers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ]

  const activeLink = (path: string) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path))

  return (
    <>
      <nav className={cn(
        "transition-all duration-300 sticky top-0 z-50 w-full",
        scrolled && "shadow-md",
        isMobile
          ? "bg-white dark:bg-gray-900"
          : "bg-white/95 backdrop-blur-md dark:bg-gray-900/95"
      )}>
        <Container className="py-3" size="full">
          <div className="flex items-center justify-between w-full px-4 md:px-6">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md mr-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-bold text-xl mobile-text-gradient">
                  Time4Meds
                </span>
              </Link>

              {isMobile && (
                <button
                  onClick={toggleMenu}
                  className="p-2 ml-3 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors"
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
              <div className="hidden md:flex items-center justify-center flex-1 px-10">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center space-x-1.5",
                        activeLink(link.path)
                          ? "bg-white dark:bg-gray-700 text-primary dark:text-primary shadow-sm"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      )}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* User Menu (Desktop) */}
            {!isMobile && (
              <div className="flex items-center gap-3">
                {user && (
                  <div className="hidden lg:flex items-center bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary font-medium">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      {user.name || 'User'}
                    </span>
                  </div>
                )}
                <ThemeToggle className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden fixed top-[57px] left-0 w-screen h-auto bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/30 z-40 animate-slideInFromTop">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-2xl text-base font-medium transition-all",
                    activeLink(link.path)
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  )}
                  onClick={toggleMenu}
                >
                  <span className="w-10 h-10 mr-3 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 pb-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                {user && (
                  <div className="px-4 py-3 rounded-2xl flex items-center bg-gray-50 dark:bg-gray-800 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary font-medium mr-3">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {user.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Logged in
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between px-1 py-2 mb-1">
                  <div className="flex items-center">
                    <ThemeToggle className="rounded-full" />
                    <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {theme === 'dark' ? 'Dark' : 'Light'} mode
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      if (toggleMenu) toggleMenu();
                    }}
                    className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      {isMobile && !isMenuOpen && (
        <div className="mobile-nav md:hidden">
          <div className="flex justify-around items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "mobile-nav-item",
                  activeLink(link.path) ? "mobile-nav-active" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl mb-1",
                  activeLink(link.path) ? "bg-primary/10 dark:bg-primary/20" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  {link.icon}
                </div>
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}

            <button
              onClick={() => toggleMenu && toggleMenu()}
              className="mobile-nav-item text-gray-500 dark:text-gray-400"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-1 bg-gray-100 dark:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className="text-xs font-medium">Menu</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}