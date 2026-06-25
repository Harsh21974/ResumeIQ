import { Link, useLocation } from 'react-router-dom';
import { FileText, Menu, X, Sparkles, ChevronDown, Moon, Sun, Home, Upload, BarChart3, PenTool } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

/**
 * Enhanced Main navigation bar component
 * Responsive design with mobile hamburger menu, theme toggle, and animations
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Navigation links configuration with icons
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/builder', label: 'Builder', icon: PenTool },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-gray-800/20'
          : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md'
      } border-b border-gray-200/30 dark:border-gray-700/30`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with Animation */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
            >
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-tight">
                Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IQ</span>
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 -mt-1 font-medium tracking-wider uppercase hidden sm:block">
                AI Powered
              </span>
            </div>
          </Link>

          
          {/* Right Section: Theme Toggle + CTA */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </motion.button>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Link to="/upload">
                <button className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={16} />
                    Get Started
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            active
                              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <Icon size={20} className={active ? 'text-blue-600 dark:text-blue-400' : ''} />
                          <span>{link.label}</span>
                          {active && (
                            <motion.div
                              layoutId="mobile-active"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Mobile CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 px-4"
                  >
                    <Link to="/upload" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                        <Sparkles size={18} />
                        Get Started Free
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;