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
    <div className="min-h-screen bg-[#0f0f0f] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-[#0f0f0f] to-black" />
          
          {/* Moving geometric shapes */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
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
              className="absolute w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"
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
          <div className="absolute inset-0 opacity-30">
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
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
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 mb-8 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
            </motion.div>
            <span className="text-blue-200 font-medium tracking-wide">
              Transcription Engine for Autonomous Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
          >
            <motion.span 
              className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-600 bg-clip-text text-transparent"
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
              className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent"
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
              className="text-3xl md:text-5xl lg:text-6xl font-light text-zinc-400/80 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Where Intelligence Meets
              <span className="block text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
                Transcription
              </span>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="text-xl md:text-2xl lg:text-3xl text-zinc-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            Experience the future of meeting intelligence. Advanced transcription technology meets 
            <span className="text-blue-400 font-medium"> autonomous AI </span>
            to transform every conversation into 
            <span className="text-blue-400 font-medium"> actionable insights </span>
            and automated workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/schedule"
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center gap-3 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
                className="group px-10 py-5 bg-zinc-900/50 backdrop-blur-sm text-white rounded-full font-semibold text-lg transition-all duration-300 hover:bg-zinc-800/70 border border-zinc-700/50 hover:border-zinc-600 flex items-center gap-3"
              >
                <span>Explore Platform</span>
                <Brain className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
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
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm border border-zinc-800/50 group-hover:border-blue-500/30 transition-all duration-300"
                  whileHover={{
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300"
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
                  <div className="text-sm text-zinc-500 font-medium tracking-wide group-hover:text-zinc-400 transition-colors duration-300">
                    {stat.label}
                  </div>
                  
                  {/* Animated accent line */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
      <section id="features" className="py-32 bg-gradient-to-b from-[#0f0f0f] to-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Advanced TEAi Features
            </h2>
            <p className="text-xl text-zinc-400">
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
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm border border-zinc-800/50 hover:border-blue-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 flex items-center justify-center mb-6 group-hover:from-blue-800/20 group-hover:to-blue-900/20 transition-all duration-500"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <feature.icon className="w-8 h-8 text-zinc-300 group-hover:text-blue-400 transition-colors duration-500" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors duration-500"
                    layoutId={`feature-title-${index}`}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-500"
                    layoutId={`feature-desc-${index}`}
                  >
                    {feature.description}
                  </motion.p>
                </div>
                
                {/* Animated corner accent */}
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent"
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
      <section id="how-it-works" className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-zinc-400">
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
                <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-4 border-2 border-zinc-700">
                  <step.icon className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-zinc-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-32 bg-gradient-to-b from-zinc-950 to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-zinc-400">
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
                className="px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
              >
                {integration}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience TEAi?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Join organizations revolutionizing their meeting intelligence with autonomous AI
            </p>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium text-lg transition-all hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105"
            >
              Start Your TEAi Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500">
          <p>&copy; 2025 TEAi - Transcription Engine for Autonomous Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
