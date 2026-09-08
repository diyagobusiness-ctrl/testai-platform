'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Star, Zap, TrendingUp, Brain, MapPin, BarChart3,
  MessageCircle, Mail, Send, Check, Users, Clock,
  Globe, AlertCircle, Eye, Tag, CheckCircle, Route,
  MessageSquare, PieChart,
} from 'lucide-react'

const Scene3D = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#0a0a2e] to-cyan-900/20" />
  ),
})

export default function ADTARBOPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a2e] text-white">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Scene3D />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-5 py-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Intelligent Business Management Platform</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Run Your Entire Business Presence
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              From One Intelligent Platform.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            ADTARBO brings your locations, reviews, local rankings, performance,
            AI automation and digital presence together in one powerful platform.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#explore"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30"
            >
              Explore Platform
            </Link>
            <Link
              href="#watch"
              className="rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Watch Platform Experience
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: '30+', label: 'Business Locations' },
              { value: '373+', label: 'Customer Reviews' },
              { value: 'AI', label: 'Powered Automation' },
              { value: '100%', label: 'Centralized Control' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="relative z-10 py-24" id="explore">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5">
              <Star className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">The ADTARBO Ecosystem</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Everything Connected.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Everything Under Control.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MapPin, title: 'My Business', desc: 'Manage all your Google Business locations from one centralized dashboard.' },
              { icon: Star, title: 'Reviews', desc: 'Monitor, analyze and respond to customer reviews at scale.' },
              { icon: TrendingUp, title: 'Performance', desc: 'Track business performance and growth metrics.' },
              { icon: Brain, title: 'AI Analysis', desc: 'Turn customer feedback into actionable business intelligence.' },
              { icon: Globe, title: 'Local Scan', desc: 'Visualize your Google Maps ranking across geographic grids.' },
              { icon: BarChart3, title: 'Reports', desc: 'Generate comprehensive business reports.' },
            ].map((mod, i) => (
              <div
                key={mod.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <mod.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{mod.title}</h3>
                <p className="text-sm text-slate-400">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Location Management */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Manage Every Location.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">From One Command Center.</span>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <MapPin className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">30 Total Locations</h3>
                  <p className="text-sm text-slate-400">Active across regions</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-purple-500/10 p-4">
                  <div className="text-sm text-slate-400">Active</div>
                  <div className="text-3xl font-bold text-purple-400">30</div>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-4">
                  <div className="text-sm text-slate-400">Verified</div>
                  <div className="text-3xl font-bold text-cyan-400">26</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <Star className="mx-auto h-5 w-5 text-yellow-400" />
                  <div className="text-xl font-bold">4.8</div>
                  <div className="text-xs text-slate-400">Ratings</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <MessageCircle className="mx-auto h-5 w-5 text-blue-400" />
                  <div className="text-xl font-bold">1,247</div>
                  <div className="text-xs text-slate-400">Posts</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <TrendingUp className="mx-auto h-5 w-5 text-green-400" />
                  <div className="text-xl font-bold">+23.4%</div>
                  <div className="text-xs text-slate-400">Growth</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 to-[#0a0a2e] p-8 backdrop-blur-sm">
              <div className="relative h-72 rounded-2xl bg-gradient-to-br from-purple-800/40 to-cyan-800/20 overflow-hidden">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300">
                  {/* City skyline */}
                  <path d="M0 280 L20 260 L40 270 L60 240 L80 250 L100 230 L120 240 L140 220 L160 230 L180 210 L200 220 L220 200 L240 210 L260 190 L280 200 L300 180 L320 190 L340 170 L360 180 L380 160 L400 170" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
                  <path d="M0 290 L40 270 L80 280 L120 250 L160 260 L200 240 L240 250 L280 230 L320 240 L360 220 L400 230" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.2" />
                  {/* Location pins */}
                  <circle cx="80" cy="200" r="6" fill="#14b8a6" opacity="0.9" />
                  <circle cx="150" cy="180" r="5" fill="#f97316" opacity="0.9" />
                  <circle cx="220" cy="190" r="7" fill="#ec4899" opacity="0.9" />
                  <circle cx="300" cy="170" r="5.5" fill="#8b5cf6" opacity="0.9" />
                  <circle cx="350" cy="160" r="6" fill="#06d6a0" opacity="0.9" />
                  {/* Connection lines */}
                  <line x1="80" y1="200" x2="200" y2="120" stroke="#6366f1" strokeWidth="1" opacity="0.4" strokeDasharray="4" />
                  <line x1="150" y1="180" x2="200" y2="120" stroke="#a855f7" strokeWidth="1" opacity="0.4" strokeDasharray="4" />
                  <line x1="220" y1="190" x2="200" y2="120" stroke="#ec4899" strokeWidth="1" opacity="0.4" strokeDasharray="4" />
                  <line x1="300" y1="170" x2="200" y2="120" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" strokeDasharray="4" />
                  <line x1="350" y1="160" x2="200" y2="120" stroke="#06d6a0" strokeWidth="1" opacity="0.4" strokeDasharray="4" />
                  {/* Center dashboard */}
                  <rect x="175" y="100" width="50" height="40" rx="8" fill="#1a1a40" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="200" y="124" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="bold">ADTARBO</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Analytics */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Turn Business Data{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Into Clear Decisions.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'CALLS', value: '12,540', change: '+28.4%', color: 'purple' },
              { icon: Route, title: 'DIRECTIONS', value: '8,932', change: '+16.8%', color: 'cyan' },
              { icon: Globe, title: 'WEBSITE CLICKS', value: '24,530', change: '+42.1%', color: 'purple' },
              { icon: MapPin, title: 'BUSINESS SEARCHES', value: '18,234', change: '+31.2%', color: 'cyan' },
              { icon: BarChart3, title: 'MAPS SEARCHES', value: '9,876', change: '+19.7%', color: 'purple' },
              { icon: PieChart, title: 'SEARCH QUERIES', value: '15,678', change: '+25.3%', color: 'cyan' },
            ].map((metric) => (
              <div key={metric.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                      <metric.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="text-sm font-medium text-slate-400">{metric.title}</div>
                    <div className="text-3xl font-bold">{metric.value}</div>
                  </div>
                  <span className="text-sm font-medium text-green-400">{metric.change}</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${metric.color === 'purple' ? 'from-purple-500 to-violet-500' : 'from-cyan-500 to-blue-500'}`} style={{ width: `${Math.random() * 40 + 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Management */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Every Customer Voice.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Clearly Understood.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { stars: 5, text: 'Excellent service and very helpful staff.', sentiment: 'Positive' },
              { stars: 4, text: 'Good service, could improve response time.', sentiment: 'Positive' },
              { stars: 3, text: 'Needs improvement in communication.', sentiment: 'Neutral' },
            ].map((review, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - review.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-slate-600" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-slate-300">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3 text-purple-400" />
                    <span className="text-xs text-purple-400">AI Analyzed</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${review.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {review.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['All Reviews', 'Positive', 'Neutral', 'Negative', 'Replied', 'Unreplied', 'Sentiment', 'Keywords'].map((feature) => (
              <div key={feature} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm backdrop-blur-sm transition-all hover:border-purple-500/50">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Review Automation */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              AI That Understands{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Your Customers.</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Customer Review', desc: '"Great service and friendly staff."', icon: MessageCircle },
                { step: '2', title: 'AI Understanding', desc: 'Analyzing sentiment...', icon: Brain },
                { step: '3', title: 'Sentiment Analysis', desc: 'Detected: Positive', icon: Zap },
                { step: '4', title: 'Auto Response', desc: 'Generating reply...', icon: Send },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:border-purple-500/50">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-400">
                    {item.step}
                  </div>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <item.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mb-2 font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-6">
              <div className="mb-2 text-xs font-medium text-purple-400">AI GENERATED RESPONSE</div>
              <p className="text-sm text-slate-300">
                &ldquo;Thank you for your wonderful review! We&apos;re delighted to hear about your excellent experience with our staff. Your feedback means the world to us and motivates our team to continue delivering exceptional service.&rdquo;
              </p>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {['Professional', 'Friendly', 'Warm', 'Formal'].map((tone) => (
                <button key={tone} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:border-purple-500/50 hover:bg-purple-500/10">
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Smart Notifications */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Know What Happens.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">The Moment It Happens.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {[
                { icon: AlertCircle, title: '1-Star Review', desc: 'Immediate Attention Required', channels: ['WhatsApp Sent', 'Email Sent', 'Team Notified'], color: 'red' },
                { icon: Clock, title: '2-3 Star Review', desc: 'Notify Manager', channels: ['Email Sent', 'Manager Notified'], color: 'yellow' },
                { icon: CheckCircle, title: '4-5 Star Review', desc: 'AI Auto Reply', channels: ['AI Auto Reply', 'Email Sent'], color: 'green' },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${rule.color === 'red' ? 'bg-red-500/20' : rule.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                    <rule.icon className={`h-5 w-5 ${rule.color === 'red' ? 'text-red-400' : rule.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{rule.title}</h3>
                    <p className="text-sm text-slate-400">{rule.desc}</p>
                    <div className="mt-2 space-y-1">
                      {rule.channels.map((ch) => (
                        <div key={ch} className={`flex items-center gap-1 text-xs ${rule.color === 'red' ? 'text-red-400' : rule.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                          <Check className="h-3 w-3" /> {ch}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-bold">Notification Channels</h3>
              <div className="grid grid-cols-2 gap-3">
                {['WhatsApp', 'Email', 'SMS', 'Teams'].map((ch) => (
                  <div key={ch} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{ch}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Business Posts */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Create.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Schedule. Publish.</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-6 grid grid-cols-3 gap-2">
              {['Standard Post', 'Offer', 'Event'].map((tab, i) => (
                <button key={tab} className={`rounded-lg py-2 text-sm font-medium transition-all ${i === 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Post Title" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-500/50" />
              <textarea placeholder="Write your post content..." rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-500/50" />
              <div className="flex gap-3">
                <button className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25">
                  Publish
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium transition-all hover:bg-white/10">
                  Save Draft
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Live', count: '32', color: 'green' },
                { label: 'Pending', count: '15', color: 'yellow' },
                { label: 'Rejected', count: '5', color: 'red' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color === 'green' ? 'text-green-400' : s.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{s.count}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Business Intelligence */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Your Reviews Are Data.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Your Data Is Opportunity.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {[
                { title: 'INSIGHT DETECTED', desc: 'Negative feedback increased by 18%', detail: 'Affected Locations: 3' },
                { title: 'REPLY HEALTH', desc: 'Response Rate 85%', detail: 'Unanswered Reviews: 12' },
                { title: 'REVIEW SENTIMENT', desc: 'Negative Issues Rising', detail: 'New Issues: 7' },
                { title: 'TOP PERFORMERS', desc: '5 locations leading', detail: 'Needs Attention: 2' },
              ].map((insight, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
                  <div className="flex items-start gap-3">
                    <Zap className="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">{insight.title}</h3>
                      <p className="mt-1 font-bold">{insight.desc}</p>
                      <p className="text-sm text-slate-400">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 to-[#0a0a2e] p-8">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold">AI Engine Active</h3>
              <p className="mb-6 text-center text-sm text-slate-400">Actively analyzing your business data for actionable insights</p>
              <div className="grid grid-cols-3 gap-3">
                {['+12%', '+8%', '+5%'].map((p, i) => (
                  <div key={i} className="rounded-lg bg-purple-500/10 px-3 py-1 text-sm text-purple-400">{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Rank Scanner */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              See Exactly{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Where You Rank.</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="relative mb-8 h-80 rounded-2xl bg-gradient-to-br from-purple-900/50 to-[#0a0a2e] overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 320">
                {/* Grid */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="320" stroke="#6366f1" strokeWidth="0.5" opacity="0.15" />
                ))}
                {Array.from({ length: 4 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 80} x2="500" y2={i * 80} stroke="#6366f1" strokeWidth="0.5" opacity="0.15" />
                ))}
                {/* Ranking pins */}
                <circle cx="100" cy="80" r="8" fill="#14b8a6" opacity="0.9" />
                <text x="100" y="83" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">1</text>
                <circle cx="200" cy="160" r="8" fill="#f97316" opacity="0.9" />
                <text x="200" y="163" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">3</text>
                <circle cx="300" cy="80" r="8" fill="#ec4899" opacity="0.9" />
                <text x="300" y="83" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">5</text>
                <circle cx="400" cy="160" r="8" fill="#8b5cf6" opacity="0.9" />
                <text x="400" y="163" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">8</text>
                <circle cx="150" cy="240" r="8" fill="#06d6a0" opacity="0.9" />
                <text x="150" y="243" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">12</text>
                <circle cx="350" cy="240" r="8" fill="#f472b6" opacity="0.9" />
                <text x="350" y="243" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">20</text>
                {/* Radius */}
                <circle cx="250" cy="160" r="140" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="6" opacity="0.3" />
                {/* Center */}
                <circle cx="250" cy="160" r="12" fill="#6366f1" stroke="white" strokeWidth="2" />
                <text x="250" y="164" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">HQ</text>
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Keyword</div>
                <div className="text-sm font-medium">Best Ayurvedic Clinic</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Grid</div>
                <div className="text-sm font-medium">5 x 5</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Radius</div>
                <div className="text-sm font-medium">4 KM</div>
              </div>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
            </div>
            <div className="mt-2 text-center text-xs text-purple-400">Scan Progress: 60%</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              How{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">ADTARBO</span>{' '}
              Works
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { step: '01', title: 'CONNECT', desc: 'Connect your business locations.' },
              { step: '02', title: 'MANAGE', desc: 'Manage reviews, posts and business information.' },
              { step: '03', title: 'ANALYZE', desc: 'Understand performance and customer sentiment.' },
              { step: '04', title: 'OPTIMIZE', desc: 'Improve local rankings and business visibility.' },
              { step: '05', title: 'AUTOMATE', desc: 'Let AI handle repetitive work.' },
              { step: '06', title: 'GROW', desc: 'Make smarter decisions and scale.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:border-purple-500/50">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-lg font-bold text-purple-400">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Use Cases */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Built For{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Every Industry</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Healthcare', icon: '🏥', locations: '50', reviews: '12,000' },
              { name: 'Restaurants', icon: '🍽', locations: '25', reviews: '8,500' },
              { name: 'Retail', icon: '🛍', locations: '100', reviews: '25,000' },
              { name: 'Franchise', icon: '🏢', locations: '200', reviews: '50,000' },
              { name: 'Automotive', icon: '🚗', locations: '15', reviews: '4,200' },
              { name: 'Education', icon: '📚', locations: '30', reviews: '6,800' },
              { name: 'Real Estate', icon: '🏠', locations: '20', reviews: '3,500' },
              { name: 'Services', icon: '🔧', locations: '40', reviews: '9,200' },
            ].map((industry) => (
              <div key={industry.name} className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10">
                <div className="mb-3 text-3xl">{industry.icon}</div>
                <h3 className="mb-2 font-bold">{industry.name}</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <div>{industry.locations} Locations</div>
                  <div>{industry.reviews} Reviews</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 to-cyan-900/30 p-16 backdrop-blur-sm">
            <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
              Your Business Is Everywhere.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Your Management Should Be In One Place.</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-slate-400">
              One Platform. Every Location. Every Review. Every Insight. Every Opportunity.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#explore" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl">
                Explore ADTARBO
              </Link>
              <Link href="#demo" className="rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all hover:bg-white/10">
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0a0a2e]/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <span className="font-bold">ADTARBO</span>
              </div>
              <p className="text-sm text-slate-400">Intelligent Business Management Platform</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Features</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">AI Intelligence</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Local SEO</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Reports</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Microsites</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Store Locator</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Product Catalogue</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Request Demo</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Support</span></li>
                <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ADTARBO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}