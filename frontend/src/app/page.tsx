'use client'

import { motion, useScroll, useTransform } from 'motion/react'
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
  Sparkles,
  Shield,
  Zap,
  Globe,
  ChevronRight,
  Star,
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
    description: 'Ace quantitative, logical reasoning & verbal ability with timed mock exams and detailed analytics.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Mic,
    title: 'Voice AI Interviews',
    description: 'Practice with Aria — our AI interviewer that listens, responds, and gives real-time feedback.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    icon: Code2,
    title: 'Y-Codes',
    description: 'Solve coding challenges with live execution across multiple languages and difficulty levels.',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: FileText,
    title: 'Resume Craft',
    description: 'Build ATS-optimized resumes with 12 professional templates and live preview.',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    icon: Briefcase,
    title: 'Job Hunt',
    description: 'Smart job matching, application tracking, and career guidance — all in one place.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
  {
    icon: GraduationCap,
    title: 'Multi-Tenant Platform',
    description: 'Institutions get their own branded space with role-based access, billing, and analytics.',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
  },
]

const stats = [
  { value: '10K+', label: 'Active Students', icon: GraduationCap },
  { value: '500+', label: 'Practice Questions', icon: Brain },
  { value: '95%', label: 'Success Rate', icon: Star },
  { value: '24/7', label: 'AI Availability', icon: Zap },
]

const techStack = [
  { name: 'Voice AI', icon: Mic, desc: 'Natural conversations' },
  { name: 'Code Engine', icon: Code2, desc: 'Multi-language support' },
  { name: 'Smart ATS', icon: FileText, desc: 'Resume optimization' },
  { name: 'Analytics', icon: Brain, desc: 'Performance insights' },
]

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* 3D Background */}
      <Scene className="fixed inset-0 z-0" />

      {/* Nav */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="text-lg font-bold gradient-text">TestAi</span>
          </div>
          <Link href="/login">
            <ButtonGlow size="sm">
              Sign In
              <ChevronRight className="ml-1 h-4 w-4" />
            </ButtonGlow>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Education Platform</span>
            </motion.div>

            <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="gradient-text">Master Your Skills</span>
              <br />
              <span className="text-foreground">Land Your Dream Job</span>
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Voice-based interview practice, coding challenges, resume building,
              aptitude tests, and job hunting — all powered by AI and designed for
              institutions to deploy at scale.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <ButtonGlow size="lg" glowColor="rgba(99, 102, 241, 0.5)">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonGlow>
              </Link>
            </div>

            {/* Trust badges */}
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { icon: Shield, text: 'Enterprise-Grade Security' },
                { icon: Globe, text: 'Multi-Tenant Architecture' },
                { icon: Zap, text: 'Real-Time AI Feedback' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <badge.icon className="h-4 w-4 text-primary" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-24 grid grid-cols-2 gap-6 sm:grid-cols-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="group rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
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
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Platform Features</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-5xl">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              A comprehensive suite of AI-powered tools designed to help students
              prepare for and land their dream careers.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                >
                  {/* Gradient glow on hover */}
                  <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />

                  <div className={`relative mb-5 inline-flex rounded-xl p-3 ${feature.bgColor}`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="relative mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="relative text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">How It Works</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-5xl">
              Start in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Sign In',
                desc: 'Access your institution\'s branded portal with your credentials.',
                icon: Shield,
              },
              {
                step: '02',
                title: 'Practice & Learn',
                desc: 'Use AI interviews, coding challenges, and aptitude tests to sharpen your skills.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Land Your Job',
                desc: 'Build a winning resume, hunt jobs, and track your applications — all in one place.',
                icon: Briefcase,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative rounded-2xl border border-border bg-card/50 p-8 text-center backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {item.step}
                </div>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack / Under the Hood */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-5xl">
              Powered by <span className="gradient-text">Cutting-Edge AI</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Built with modern technologies for performance, scalability, and reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                className="group rounded-2xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <tech.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold">{tech.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background decoration */}
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />

            <h2 className="relative mb-4 text-3xl font-bold sm:text-5xl">
              Ready to <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="relative mb-10 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of students and institutions already using TestAi to
              transform how they prepare for careers.
            </p>
            <div className="relative">
              <Link href="/login">
                <ButtonGlow size="lg" glowColor="rgba(99, 102, 241, 0.5)">
                  Sign In to TestAi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonGlow>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="font-bold gradient-text">TestAi</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered education platform for institutions and students.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><span className="text-muted-foreground">Voice AI Interviews</span></li>
                <li><span className="text-muted-foreground">Coding Challenges</span></li>
                <li><span className="text-muted-foreground">Resume Builder</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-muted-foreground">Aptitude Practice</span></li>
                <li><span className="text-muted-foreground">Job Listings</span></li>
                <li><span className="text-muted-foreground">Analytics Dashboard</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-muted-foreground">Privacy Policy</span></li>
                <li><span className="text-muted-foreground">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TestAi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
