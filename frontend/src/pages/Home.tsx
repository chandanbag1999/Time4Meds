import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button-modern'
import { Container } from '@/components/ui/container'
import { Card } from '@/components/ui/card'

export default function Home() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Refs for sections
  const featuresRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll to section function
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 w-screen">
        <Container className="py-3 flex justify-between items-center" size="full">
          <Link to="/" className="font-bold text-xl text-primary-600">
            Time4Meds
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection(featuresRef)} 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection(howItWorksRef)} 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection(pricingRef)} 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection(aboutRef)} 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              About
            </button>
          </nav>
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden p-2 text-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Log In</Link>
            <Button 
              variant="primary" 
              size="sm" 
              href="/register"
              asChild
            >
              Sign Up
            </Button>
          </div>
        </Container>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="py-3 px-4 space-y-3">
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection(howItWorksRef)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                How it Works
              </button>
              <button 
                onClick={() => scrollToSection(pricingRef)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection(aboutRef)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                About
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 w-full bg-white">
        <Container size={isMobile ? "lg" : "2xl"} className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="md:w-1/2 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Never Miss Your <span className="text-primary-600">Medication</span> Again
            </h1>
            <p className="text-gray-600 mb-6">
              Time4Meds is an advanced medication reminder and tracking app to help you stay on top of your health. Simple, reliable medication management for you and your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="primary" 
                size="md" 
                href="/register"
                asChild
                className="px-6"
              >
                Get Started - It's Free
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                href="/how-it-works"
                asChild
              >
                See how it works
              </Button>
            </div>
            <div className="mt-6 flex items-center text-sm text-gray-500">
              <span className="flex items-center">
                <span className="text-gray-400">Trusted by</span>
                <span className="font-semibold ml-1">10,000+</span>
                <span className="ml-1">users</span>
              </span>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0">
            <div className="relative w-64 md:w-72 h-auto">
              <div className="absolute inset-0 bg-primary-100 rounded-3xl transform rotate-6 scale-95 opacity-20"></div>
              <div className="relative border-8 border-gray-800 rounded-3xl overflow-hidden bg-white shadow-xl">
                <div className="w-full h-[450px] bg-gradient-to-b from-primary-100 to-primary-200 flex flex-col items-center justify-center p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Time4Meds</h3>
                  <p className="text-sm text-gray-600">Never miss your medication again with smart reminders</p>
                  
                  <div className="mt-8 w-full bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                        T4M
                      </div>
                      <div className="ml-3">
                        <div className="h-2 w-24 bg-gray-200 rounded"></div>
                        <div className="h-2 w-16 bg-gray-200 rounded mt-1"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center p-2 border border-gray-100 rounded-md">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="ml-3 flex-grow">
                            <div className="h-2 w-20 bg-gray-200 rounded"></div>
                            <div className="h-2 w-12 bg-gray-200 rounded mt-1"></div>
                          </div>
                          <div className="text-xs text-primary-600 font-medium">8:00 AM</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-gray-50 w-full">
        <Container size={isMobile ? "lg" : "2xl"}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Smart Features for Better Health</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Time4Meds offers intelligent tools to simplify medication management and improve adherence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Smart Reminders</h3>
                <p className="text-gray-600 text-sm">
                  Never miss a dose with timely notifications and intelligent reminders that adapt to your habits.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Medication Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Track your medication intake and maintain a complete history of your health journey.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Family Sharing</h3>
                <p className="text-gray-600 text-sm">
                  Manage medications for family members and loved ones all from one account.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Adherence Reports</h3>
                <p className="text-gray-600 text-sm">
                  Detailed reports and insights on your medication usage to share with your healthcare providers.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Cloud Sync</h3>
                <p className="text-gray-600 text-sm">
                  Access your data securely across all devices for seamless medication tracking.
                </p>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Privacy & Security</h3>
                <p className="text-gray-600 text-sm">
                  Your health data is encrypted and protected using secure methods.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-16 bg-white w-full">
        <Container size={isMobile ? "lg" : "2xl"}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How Time4Meds Works</h2>
            <p className="text-gray-600">A simple 3-step process to help you stay on top of your medication</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600 text-sm">
                Sign up in minutes using your email, Google, or Instagram account
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Your Medications</h3>
              <p className="text-gray-600 text-sm">
                Input your medications, dosages, and schedules
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Smart Reminders</h3>
              <p className="text-gray-600 text-sm">
                Receive customized alerts on time to take your medications
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button 
              variant="primary" 
              href="/register"
              asChild
            >
              Get Started Now
            </Button>
          </div>
        </Container>
      </section>

      {/* Seamless Experience Section */}
      <section className="py-16 bg-gray-50 w-full">
        <Container size={isMobile ? "lg" : "2xl"}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">A Seamless Experience Across All Devices</h2>
            <p className="text-gray-600">
              Whether on desktop, tablet, or mobile, Time4Meds provides a beautiful and intuitive interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            <Card className="p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Smart Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Get a complete overview of your medications at a glance
              </p>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Medication Management</h3>
              <p className="text-gray-600 text-sm">
                Easily add, edit, and manage your medications
              </p>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Smart Reminders</h3>
              <p className="text-gray-600 text-sm">
                Timely notifications that adapt to your schedule
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-16 bg-white w-full">
        <Container size={isMobile ? "lg" : "2xl"}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">
              Choose the plan that's right for you, with no hidden fees
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
            <Card className="p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Free</h3>
                <p className="text-xs text-gray-500">Perfect to get started</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-gray-600">Up to 3 medications</li>
                <li className="text-sm text-gray-600">Basic reminders</li>
                <li className="text-sm text-gray-600">Medication tracking</li>
                <li className="text-sm text-gray-600">Activity history</li>
                <li className="text-sm text-gray-600">Standard support</li>
              </ul>
              <Button 
                variant="outline" 
                size="md" 
                href="/register"
                asChild
                className="w-full"
              >
                Sign Up Free
              </Button>
            </Card>
            
            <Card className="p-6 border-2 border-primary-500 relative">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-3 py-1 uppercase font-bold">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Premium</h3>
                <p className="text-xs text-gray-500">For individuals</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$4.99</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-gray-600">Unlimited medications</li>
                <li className="text-sm text-gray-600">Smart reminders</li>
                <li className="text-sm text-gray-600">Detailed tracking</li>
                <li className="text-sm text-gray-600">Basic reports</li>
                <li className="text-sm text-gray-600">Priority support</li>
              </ul>
              <Button 
                variant="primary" 
                size="md" 
                href="/register"
                asChild
                className="w-full"
              >
                Get Premium
              </Button>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Family</h3>
                <p className="text-xs text-gray-500">For families & caregivers</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-gray-600">Up to 5 family members</li>
                <li className="text-sm text-gray-600">Caregiver access</li>
                <li className="text-sm text-gray-600">Enhanced reports</li>
                <li className="text-sm text-gray-600">Priority support</li>
              </ul>
              <Button 
                variant="outline" 
                size="md" 
                href="/register"
                asChild
                className="w-full"
              >
                Get Family Plan
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 w-full">
        <Container size={isMobile ? "lg" : "2xl"}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">What Our Users Say</h2>
            <p className="text-gray-600">
              Don't just take our word for it - hear from some of our satisfied users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            <Card className="p-6 border border-gray-200">
              <p className="text-gray-600 mb-4 text-sm italic">
                "Time4Meds has been a game-changer for me. I used to forget my blood pressure medication at least once a week, but now I'm much more consistent."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Using for 3 months</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <p className="text-gray-600 mb-4 text-sm italic">
                "As a caregiver for my dad, this app helped me manage his medications effectively. I can track everything remotely, which gives me peace of mind."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Michael Torres</p>
                  <p className="text-xs text-gray-500">Using for 6+ months</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border border-gray-200">
              <p className="text-gray-600 mb-4 text-sm italic">
                "The interface is so intuitive! I love how my upcoming medication alerts appear and how the adherence tracking works."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Emily Chen</p>
                  <p className="text-xs text-gray-500">Using for 1+ month</p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* About/Footer Section */}
      <footer ref={aboutRef} className="bg-gray-900 text-gray-300 py-12 w-screen">
        <Container size="full">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Time4Meds</h3>
              <p className="text-sm text-gray-400 mb-4">
                Smart medication reminders for a healthier life
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">About Us</Link></li>
                <li><Link to="/" className="hover:text-white">Careers</Link></li>
                <li><Link to="/" className="hover:text-white">Blog</Link></li>
                <li><Link to="/" className="hover:text-white">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Subscribe</h4>
              <p className="text-sm text-gray-400 mb-3">Get the latest news and updates</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-3 py-2 bg-gray-800 text-white rounded-l-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary-500" 
                />
                <button className="bg-primary-500 text-white px-3 py-2 rounded-r-md text-sm">
                  →
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-500">
            <div className="flex justify-between items-center flex-col md:flex-row gap-4">
              <p>&copy; {new Date().getFullYear()} Time4Meds. All rights reserved.</p>
              <div className="flex space-x-4">
                <Link to="/" className="hover:text-white">Privacy Policy</Link>
                <Link to="/" className="hover:text-white">Terms of Service</Link>
                <Link to="/" className="hover:text-white">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
} 