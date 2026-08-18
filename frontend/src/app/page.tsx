'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ButtonGlow } from '@/components/animations'
import { 
  GraduationCap, 
  Code2, 
  Mic, 
  FileText, 
  Briefcase, 
  Brain,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
  ),
})

const features = [
  {
    icon: Brain,
    title: 'Aptitude Arena',
    description: 'Practice quantitative, logical reasoning, and verbal ability with timed exams.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Mic,
    title: 'Voice AI',
    description: 'Practice interviews with AI-powered voice recognition and real-time feedback.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Code2,
    title: 'Y-Codes',
    description: 'Solve coding challenges with live execution in multiple languages.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: FileText,
    title: 'Resume Craft',
    description: 'Build ATS-friendly resumes with 5 professional templates.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Briefcase,
    title: 'Job Hunt',
    description: 'Find and apply to jobs with smart filters and application tracking.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: GraduationCap,
    title: 'Multi-Tenant',
    description: 'Manage multiple organizations with role-based access control.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
]

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Questions' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'Availability' },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <Scene className="fixed inset-0 z-0" />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Now in Beta</span>
            </motion.div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="gradient-text">Master Your Skills</span>
              <br />
              <span className="text-foreground">With TestAi</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A comprehensive multi-tenant education platform with voice-based practice, 
              coding challenges, resume building, and aptitude testing.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <ButtonGlow size="lg" glowColor="rgba(99, 102, 241, 0.5)">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonGlow>
              </Link>
              <Link href="/demo">
                <ButtonGlow variant="outline" size="lg">
                  Watch Demo
                </ButtonGlow>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-background/80 backdrop-blur-lg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our platform offers a comprehensive suite of tools to help students
              prepare for their dream careers.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bgColor}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of students who are already mastering their skills with TestAi.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <ButtonGlow size="lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonGlow>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {['No credit card required', 'Free 100 credits', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background/80 backdrop-blur-lg py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="font-bold gradient-text">TestAi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TestAi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
