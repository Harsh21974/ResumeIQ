import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  FileSearch,
  Star,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Home = () => {
  const [stats, setStats] = useState([
    { value: 0, label: 'Resumes Analyzed', icon: FileSearch, target: 10000 },
    { value: 0, label: 'Success Rate', icon: Award, target: 85 },
    { value: 0, label: 'User Rating', icon: Star, target: 4.9 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats =>
        prevStats.map(stat => ({
          ...stat,
          value: Math.min(stat.value + Math.ceil(stat.target / 50), stat.target),
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FileSearch,
      title: 'ATS Score Analysis',
      description:
        'Get an instant compatibility score showing how well your resume performs with ATS systems.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Role Matching',
      description:
        'Discover job roles that best match your skills using AI-powered insights.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Improvement Tips',
      description:
        'Receive actionable suggestions to enhance your resume and boost hiring chances.',
      gradient: 'from-orange-500 to-yellow-500',
    },
    {
      icon: TrendingUp,
      title: 'Interview Roadmap',
      description:
        'Get a personalized preparation roadmap to ace technical interviews.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'ResumeIQ helped me land my dream job at Google. The insights were game-changing!',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Product Manager',
      content: 'The ATS score analysis was incredibly accurate. I got 3x more interview calls.',
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative pt-32 pb-24 overflow-hidden"
      >
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium shadow-lg"
          >
            <Sparkles size={16} />
            AI-Powered Resume Analysis
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            Analyze. Improve.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            ResumeIQ analyzes your resume, gives ATS insights, and helps you
            prepare for your dream job interviews.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/upload">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Analyze My Resume
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <Link to="/builder">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 bg-white dark:bg-gray-800"
              >
                Build Resume
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-300"
          >
            {['Free to use', 'No signup required', 'Instant results'].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  {item}
                </div>
              )
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* STATS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.label === 'User Rating' ? stat.value.toFixed(1) : stat.value}
                  {stat.label === 'Success Rate' && '%'}
                  {stat.label === 'User Rating' && '★'}
                </div>
                <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                  <Icon size={16} className="text-blue-500" />
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Everything you need to land your dream job
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Optimize your resume and prepare smarter with ResumeIQ tools.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  "{testimonial.content}"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your job search?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Upload your resume now and get instant insights to boost interview
            calls.
          </p>
          <Link to="/upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 mx-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Get Started Free
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;