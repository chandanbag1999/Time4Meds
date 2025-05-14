import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button-modern';
import { Container } from '@/components/ui/container';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { Zap, BarChart2, Users, CheckCircle, ArrowRight } from 'lucide-react';

const SectionWrapper: React.FC<{ children: React.ReactNode; className?: string, id?: string }> = ({ children, className = '', id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6 }}
    className={`py-16 md:py-24 ${className}`}
  >
    {children}
  </motion.section>
);

export default function Home() {
  // Smooth scroll for internal links - simplified to avoid Promise issues
  const handleInternalLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId.substring(1));
    if (targetElement) {
      // Using standard scroll instead of smooth scroll behavior to avoid Promise-related issues
      targetElement.scrollIntoView();
    }
  };

  const navLinkClasses = "text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <Container size="full" className="py-4 px-4 md:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/30">
              T4M
            </div>
            <span className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Time4Meds
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {/* Using direct href with hash instead of click handler to avoid Promise issues */}
            <a href="#features" className={navLinkClasses}>Features</a>
            <a href="#pricing" className={navLinkClasses}>Pricing</a>
            <a href="#about" className={navLinkClasses}>About</a>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" href="/login" asChild className="hidden sm:flex rounded-lg border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400">
                Log In
            </Button>
            <Button variant="primary" size="sm" href="/register" asChild className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/30">
                Sign Up Free
              </Button>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <SectionWrapper className="pt-24 md:pt-32 text-center overflow-hidden">
        <Container size="2xl" className="relative">
          <motion.div 
            className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200 dark:bg-indigo-700/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-50 animate-blob"
            initial={{ scale: 0.8, opacity: 0}}
            animate={{ scale: 1, opacity: 0.5}}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror"}}
          />
          <motion.div 
            className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-200 dark:bg-purple-700/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-50 animate-blob animation-delay-2000"
            initial={{ scale: 0.8, opacity: 0}}
            animate={{ scale: 1, opacity: 0.5}}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", delay: 0.5}}
           />

          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 leading-tight z-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Never Miss a Dose Again.
            <br className="hidden sm:inline" />
            Your Health, Simplified.
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed z-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Time4Meds is the intelligent medication reminder and tracker that helps you manage your health effortlessly, so you can focus on living your life.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 z-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
              <Button 
                variant="primary" 
                size="lg" 
                href="/register"
                asChild
              className="w-full sm:w-auto rounded-lg text-lg px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-600/50 transition-all duration-300 transform hover:scale-105"
              >
                Get Started - It's Free
              </Button>
            {/* Using direct href instead of onClick handler */}
              <Button 
                variant="outline" 
                size="lg" 
              href="#features"
                asChild
              className="w-full sm:w-auto rounded-lg text-lg px-8 py-3 border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
            >
              Learn More <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
          </motion.div>
        </Container>
      </SectionWrapper>

      {/* Features Section */}
      <SectionWrapper id="features" className="bg-white dark:bg-gray-800/50">
        <Container size="2xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Why Choose Time4Meds?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Packed with features designed for your peace of mind and better health outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />,
                title: "Smart Reminders",
                description: "Intelligent, customizable notifications so you never forget a medication."
              },
              {
                icon: <BarChart2 className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
                title: "Progress Tracking",
                description: "Monitor your adherence and share insightful reports with your doctor."
              },
              {
                icon: <Users className="w-10 h-10 text-pink-500 dark:text-pink-400" />,
                title: "Family & Caregiver Mode",
                description: "Easily manage medications for your loved ones, all in one place."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-5">
                    {feature.icon}
                  </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Placeholder for Pricing Section (if needed in future) */}
      <SectionWrapper id="pricing" className="bg-gray-50 dark:bg-gray-900">
        <Container size="2xl" className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10">
                Choose a plan that fits your needs. All plans start with a free trial.
            </p>
            {/* Pricing cards would go here */}
            <p className="text-md text-gray-500 dark:text-gray-400">Pricing details coming soon...</p>
        </Container>
      </SectionWrapper>

      {/* Call to Action Section (About can be part of Footer or its own small section) */}
      <SectionWrapper id="about" className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <Container size="2xl" className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready to Take Control of Your Health?</h2>
          <p className="text-lg md:text-xl text-indigo-100 dark:text-indigo-200 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust Time4Meds for their medication management. Sign up today for free!
          </p>
                <Button 
            variant="secondary" 
                  size="lg" 
                  href="/register"
                  asChild
            className="rounded-lg text-lg px-10 py-4 bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Start Your Free Trial Now <CheckCircle className="ml-2 w-6 h-6" />
                </Button>
        </Container>
      </SectionWrapper>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-12">
        <Container size="full" className="text-center px-4 md:px-6 lg:px-8 text-gray-600 dark:text-gray-400">
          <div className="flex justify-center items-center gap-2 mb-4">
             <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-md shadow-sm shadow-indigo-500/30">
              T4M
            </div>
            <span className="font-semibold text-md">
                  Time4Meds
                </span>
              </div>
          <p className="text-sm mb-2">
            Making medication management simple and effective.
          </p>
          <p className="text-sm">
              &copy; {new Date().getFullYear()} Time4Meds. All rights reserved.
            <Link to="/privacy" className="ml-2 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link> 
            | <Link to="/terms" className="ml-1 hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link>
          </p>
        </Container>
      </footer>
    </div>
  );
} 