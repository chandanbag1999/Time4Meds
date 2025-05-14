import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BellRing, ListChecks, Users, TrendingUp, ShieldCheck, Zap, Award, ExternalLink } from 'lucide-react';

// Component for individual feature card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animationProps: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, animationProps }) => (
  <motion.div {...animationProps} className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-full mb-5 shadow-md">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  // Animation variants for Framer Motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
        ease: "easeInOut"
      }
    }
  };
  
  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const navLinkStagger = {
    hidden: {}, 
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navigation Bar */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navLinkStagger}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-lg shadow-lg"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <motion.div variants={navItemVariants}>
            <Link to="/" className="text-3xl font-bold text-white flex items-center">
              Time<span className="text-indigo-400">4</span>Meds
              <motion.span 
                className="ml-2 w-3 h-3 bg-sky-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </Link>
          </motion.div>
          <motion.div variants={navLinkStagger} className="flex items-center space-x-2 sm:space-x-3">
            <motion.div variants={navItemVariants}>
              <Link to="/login" className="text-slate-300 hover:text-indigo-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm sm:text-base">
                Log In
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 sm:px-5 py-2 rounded-lg shadow-md hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Sign Up Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="pt-32 pb-16 md:pt-44 md:pb-24 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
      >
         <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] opacity-5 animate-pulse-slow">
            <div className="absolute inset-0 bg-gradient-radial from-sky-500/30 via-transparent to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[150%] opacity-5 animate-pulse-slow animation-delay-2000">
            <div className="absolute inset-0 bg-gradient-radial from-indigo-600/30 via-transparent to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.h1
            variants={fadeIn}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight"
          >
            Effortless Medication Management. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500">
              Peace of Mind, Delivered.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-md sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Time4Meds helps you stay on track with your health journey. Smart reminders, easy logging, and insightful progress. Never miss a dose again.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-lg shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg flex items-center justify-center"
            >
              Get Started Free <Zap size={20} className="ml-2" />
            </Link>
            <Link
              to="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-slate-600/50 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg flex items-center justify-center"
            >
              Learn More <ExternalLink size={20} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="py-16 md:py-24 bg-slate-900"
      >
        <div className="container mx-auto px-6">
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center text-white mb-4 tracking-tight">
            All-In-One Medication Mastery
          </motion.h2>
          <motion.p variants={fadeIn} className="text-md sm:text-lg text-slate-400 text-center mb-12 md:mb-16 max-w-xl mx-auto leading-relaxed">
            Discover the features that make managing your medications simpler, smarter, and more effective than ever before.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<BellRing size={24} />}
              title="Smart Reminders"
              description="Intelligent, timely, and customizable notifications so you never miss a dose. Adapts to your schedule and offers snooze options."
            />
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<ListChecks size={24} />}
              title="Comprehensive Logging"
              description="Effortlessly log taken, skipped, or missed doses with optional notes for a complete and accurate medication history."
            />
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<TrendingUp size={24} />}
              title="Progress Tracking"
              description="Visualize your adherence trends with intuitive charts and share progress reports with your healthcare provider easily."
            />
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<Users size={24} />}
              title="Family Accounts"
              description="Manage medications for loved ones under one account. Perfect for caregivers to support family members. (Coming Soon)"
            />
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<ShieldCheck size={24} />}
              title="Secure & Private"
              description="Your health data is encrypted and protected with industry-standard security measures. Your privacy is our priority."
            />
            <FeatureCard
              animationProps={{variants: fadeIn}}
              icon={<Zap size={24} />}
              title="Quick & Easy Setup"
              description="Get started in minutes. Our intuitive interface makes adding medications and setting up schedules a breeze for all users."
            />
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-16 md:py-24 bg-slate-800/70"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div variants={fadeIn} className="lg:w-1/2 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <img src="/placeholder-app-mockup.svg" alt="Time4Meds App Mockup" className="relative rounded-xl shadow-2xl object-cover w-full h-auto md:max-h-[450px] border-2 border-slate-700" />
            </motion.div>
            <motion.div variants={fadeIn} className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                Take Control of Your Health, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Simply.</span>
              </h2>
              <p className="text-md sm:text-lg text-slate-400 mb-6 leading-relaxed">
                Time4Meds is designed with you in mind. We believe managing your health shouldn't add to your stress. Our user-friendly platform empowers you to:
              </p>
              <ul className="space-y-4 text-slate-300 text-base sm:text-lg mb-8">
                <motion.li variants={fadeIn} className="flex items-start"><Award strokeWidth={1.5} className="w-7 h-7 text-indigo-400 mr-3 shrink-0 mt-0.5" /> Reduce stress and anxiety about complex medication schedules.</motion.li>
                <motion.li variants={fadeIn} className="flex items-start"><Award strokeWidth={1.5} className="w-7 h-7 text-indigo-400 mr-3 shrink-0 mt-0.5" /> Improve adherence for better health outcomes and well-being.</motion.li>
                <motion.li variants={fadeIn} className="flex items-start"><Award strokeWidth={1.5} className="w-7 h-7 text-indigo-400 mr-3 shrink-0 mt-0.5" /> Gain clarity with insightful reports on your medication patterns.</motion.li>
                <motion.li variants={fadeIn} className="flex items-start"><Award strokeWidth={1.5} className="w-7 h-7 text-indigo-400 mr-3 shrink-0 mt-0.5" /> Feel confident and in control of your personal treatment plan.</motion.li>
              </ul>
              <motion.div variants={fadeIn}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
                >
                  Start Your Journey Today <Zap size={20} className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Final Call to Action Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="py-16 md:py-24 bg-slate-900 text-center"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Simplify Your Medication Routine?
          </h2>
          <p className="text-md sm:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands who are taking control of their health with Time4Meds. It's free to get started, and the peace of mind is priceless.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-lg shadow-xl hover:shadow-indigo-500/70 transition-all duration-300 transform hover:scale-105 text-lg sm:text-xl"
          >
            Create Your Free Account Now
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-10 bg-slate-900 border-t border-slate-700/50">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <Link to="/" className="text-2xl font-bold text-slate-200 mb-4 inline-block">
            Time<span className="text-indigo-400">4</span>Meds
          </Link>
          <p className="text-sm">&copy; {new Date().getFullYear()} Time4Meds. All rights reserved.</p>
          <p className="text-xs mt-1">Your health, simplified and secured.</p>
          <div className="mt-6 space-x-4 sm:space-x-6">
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors text-sm">Terms of Service</Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors text-sm">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 