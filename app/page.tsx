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
      title: 'Real-Time Monitoring',
      description: 'Listen and transcribe calls across Google Meet, Zoom, and Teams with 90%+ accuracy.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Extract action items, commitments, and sentiment using advanced LLM technology.',
    },
    {
      icon: Zap,
      title: 'Autonomous Execution',
      description: 'Automatically execute tasks with configurable approval workflows.',
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Role-based permissions with complete audit trails for all actions.',
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
    { value: '40-50%', label: 'Productivity Increase' },
    { value: '3-4 hrs', label: 'Saved Per Day' },
    { value: '90%+', label: 'Transcription Accuracy' },
    { value: '95%+', label: 'Task Success Rate' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0f0f0f] to-black" />
          <div className="absolute inset-0 opacity-20">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-zinc-600 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 mb-8"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-zinc-300">AI-Powered Meeting Automation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
          >
            Autonomous Call Tracking
            <br />
            <span className="text-zinc-500">That Never Sleeps</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto"
          >
            Transform every call into actionable insights. Real-time transcription, intelligent analysis, 
            and autonomous task execution—all powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/schedule"
              className="group px-8 py-4 bg-white text-black rounded-full font-medium text-lg transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center gap-2"
            >
              Schedule Your First Meeting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-zinc-800 text-white rounded-full font-medium text-lg transition-all hover:bg-zinc-700 border border-zinc-700"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
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
              Powerful Features
            </h2>
            <p className="text-xl text-zinc-400">
              Everything you need to automate your meeting workflows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-zinc-900/50"
              >
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                  <feature.icon className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
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
              { icon: Calendar, title: 'Schedule', description: 'Book your meeting on Google Meet or Zoom' },
              { icon: Phone, title: 'Monitor', description: 'AI joins and transcribes in real-time' },
              { icon: Brain, title: 'Analyze', description: 'Extract insights and action items' },
              { icon: Zap, title: 'Execute', description: 'Automatically complete tasks' },
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
              Ready to Reclaim Your Time?
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Join teams saving 3-4 hours per day on administrative tasks
            </p>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium text-lg transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500">
          <p>&copy; 2025 AutoTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
