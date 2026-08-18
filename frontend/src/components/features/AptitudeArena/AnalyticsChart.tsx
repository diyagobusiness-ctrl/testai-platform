'use client'

import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts'

interface AnalyticsData {
  scoreProgression: { date: string; score: number }[]
  categoryAccuracy: { category: string; accuracy: number }[]
  performanceVsAverage: { metric: string; you: number; average: number }[]
}

interface AnalyticsChartProps {
  data: AnalyticsData
}

const COLORS = ['#6366f1', '#14b8a6', '#c084fc', '#f59e0b', '#ef4444']

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Score Progression */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Score Progression</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.scoreProgression}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy by Category */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Accuracy by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.categoryAccuracy}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, accuracy }) => `${category}: ${accuracy}%`}
              outerRadius={100}
              dataKey="accuracy"
            >
              {data.categoryAccuracy.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Performance vs Average */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Performance vs Class Average</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.performanceVsAverage}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="you" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="average" fill="#c084fc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default AnalyticsChart
