import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Github, 
  Linkedin, 
  Twitter, 
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Users,
  Briefcase,
  BookOpen,
  MessageCircle,
  Send
} from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Changelog', href: '#changelog' },
    ],
    resources: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API Reference', href: '#api' },
      { label: 'Community', href: '#community' },
      { label: 'Support', href: '#support' },
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'GDPR', href: '#gdpr' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-blue-400' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-600' },
    { icon: Github, label: 'GitHub', href: '#', color: 'hover:bg-gray-600' },
    { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:bg-red-500' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-800/50">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <span className="text-2xl font-bold tracking-tight">
                  Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IQ</span>
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 font-medium tracking-wider">
                  AI POWERED
                </p>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Transform your job search with AI-powered resume analysis, 
              ATS optimization, and personalized interview preparation.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, label: 'Secure & Private' },
                { icon: Zap, label: 'Instant Results' },
                { icon: Heart, label: 'Loved by 10K+' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                  <badge.icon size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 ${social.color}`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Sections - 8 columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 capitalize flex items-center gap-2">
                  {category === 'product' && <Briefcase size={16} className="text-blue-500" />}
                  {category === 'resources' && <BookOpen size={16} className="text-purple-500" />}
                  {category === 'company' && <Users size={16} className="text-green-500" />}
                  {category === 'legal' && <Shield size={16} className="text-orange-500" />}
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>© {currentYear} ResumeIQ. All rights reserved.</span>
              <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
              <span className="flex items-center gap-1">
                Made with <Heart size={12} className="text-red-500 fill-red-500" /> for job seekers
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </a>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Sparkles size={12} className="text-blue-500" />
                <span className="text-[10px] font-medium">v2.0.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;