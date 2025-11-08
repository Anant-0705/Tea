'use client';

import { motion } from 'framer-motion';
import { 
  Phone, 
  Brain, 
  Zap, 
  Shield, 
  Calendar, 
  Mail, 
  FileText, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  const features = [
    {
      icon: Phone,
      title: 'Real-Time Transcription',
      description: 'Advanced speech-to-text technology with 95%+ accuracy across all major platforms.',
    },
    {
      icon: Brain,
      title: 'Autonomous Intelligence',
      description: 'AI-powered analysis extracts insights, action items, and commitments automatically.',
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Intelligent task execution with configurable workflows and approval systems.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption with comprehensive audit trails and compliance features.',
    },
  ];

  const integrations = [
    'Google Meet',
    'Zoom',
    'Microsoft Teams',
    'Google Calendar',
    'Gmail',
    'Salesforce CRM',
    'HubSpot',
    'Slack',
    'Jira',
  ];

  const stats = [
    { value: '95%+', label: 'Transcription Accuracy' },
    { value: '3-4 hrs', label: 'Saved Per Day' },
    { value: '40-50%', label: 'Productivity Increase' },
    { value: '98%+', label: 'Automation Success' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
          
          {/* Moving geometric shapes */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ top: '10%', left: '10%' }}
            />
            <motion.div
              className="absolute w-64 h-64 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, 100, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
              style={{ bottom: '10%', right: '10%' }}
            />
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-emerald-400/30 to-green-600/30 rounded-full"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Neural network lines */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              {[...Array(6)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={`${10 + i * 15}%`}
                  y1="10%"
                  x2={`${20 + i * 15}%`}
                  y2="90%"
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 border border-gray-200 mb-8 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <span className="text-gray-700 font-medium tracking-wide">
                  Transcription Engine for Autonomous Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
              >
                <motion.span 
                  className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  TEA
                </motion.span>
                <motion.span 
                  className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  i
                </motion.span>
                <br />
                <motion.span 
                  className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-600 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  Where Intelligence Meets
                  <span className="block text-gradient bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent font-medium">
                    Transcription
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed font-light"
              >
                Experience the future of meeting intelligence. Advanced transcription technology meets 
                <span className="text-emerald-500 font-medium"> autonomous AI </span>
                to transform every conversation into 
                <span className="text-emerald-500 font-medium"> actionable insights </span>
                and automated workflows.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/schedule"
                    className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center gap-3 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Start Your TEAi Journey</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/dashboard"
                    className="group px-10 py-5 bg-white border border-gray-300 text-gray-800 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-3"
                  >
                    <span>Explore Platform</span>
                    <Brain className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side - Landing Page Image */}
            <div className="hidden lg:flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <motion.img
                  src="/landing_page2.jpg"
                  alt="TEAi Platform Interface"
                  className="w-full max-w-lg h-auto rounded-2xl shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                {/* Optional glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            </div>
          </div>

          {/* Enhanced Stats - Below the main content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.4 + index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-pointer"
              >
                <motion.div 
                  className="relative p-6 rounded-2xl bg-white border border-gray-200 group-hover:border-emerald-200 transition-all duration-300 shadow-sm group-hover:shadow-md"
                  whileHover={{
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-black mb-2 group-hover:text-emerald-500 transition-colors duration-300"
                    animate={{ 
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-gray-500 font-medium tracking-wide group-hover:text-gray-600 transition-colors duration-300">
                    {stat.label}
                  </div>
                  
                  {/* Animated accent line */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "60%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Advanced TEAi Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for intelligent meeting automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group relative p-8 rounded-3xl bg-white border border-gray-200 hover:border-emerald-200 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-lg"
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center mb-6 transition-all duration-500"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <feature.icon className="w-8 h-8 text-gray-600 group-hover:text-emerald-500 transition-colors duration-500" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-black mb-4 group-hover:text-emerald-600 transition-colors duration-500"
                    layoutId={`feature-title-${index}`}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500"
                    layoutId={`feature-desc-${index}`}
                  >
                    {feature.description}
                  </motion.p>
                </div>
                
                {/* Animated corner accent */}
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100/50 to-transparent"
                  initial={{ scale: 0, rotate: 45 }}
                  whileHover={{ scale: 1, rotate: 45 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to transform your workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Calendar, title: 'Connect', description: 'Integrate with your meeting platforms' },
              { icon: Phone, title: 'Transcribe', description: 'AI captures and transcribes in real-time' },
              { icon: Brain, title: 'Analyze', description: 'Extract intelligent insights automatically' },
              { icon: Zap, title: 'Automate', description: 'Execute tasks autonomously' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 border-gray-200">
                  <step.icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Connect with your favorite tools
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
              >
                {integration}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to Experience TEAi?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join organizations revolutionizing their meeting intelligence with autonomous AI
            </p>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105"
            >
              Start Your TEAi Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2025 TEAi - Transcription Engine for Autonomous Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
