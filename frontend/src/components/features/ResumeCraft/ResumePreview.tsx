'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { templates, type Template } from './TemplateSelector'
import type { PersonalInfo } from './PersonalInfoStep'
import type { EducationEntry } from './EducationStep'
import type { ExperienceEntry } from './ExperienceStep'
import type { Skill } from './SkillsStep'
import type { ProjectEntry } from './ProjectsStep'
import type { CertificationEntry } from './CertificationsStep'
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderKanban,
  Award,
} from 'lucide-react'

interface ResumePreviewProps {
  personalInfo: PersonalInfo
  summary: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: Skill[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  selectedTemplate: string
  className?: string
}

function getTemplateStyles(templateId: string): Template {
  return templates.find((t) => t.id === templateId) || templates[0]
}

function SectionHeader({
  title,
  icon: Icon,
  color,
}: {
  title: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div
        className="flex h-6 w-6 items-center justify-center rounded"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <h3
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {title}
      </h3>
      <div className="h-px flex-1" style={{ backgroundColor: `${color}30` }} />
    </div>
  )
}

export default function ResumePreview({
  personalInfo,
  summary,
  education,
  experience,
  skills,
  projects,
  certifications,
  selectedTemplate,
  className,
}: ResumePreviewProps) {
  const template = getTemplateStyles(selectedTemplate)
  const { primary, secondary, accent } = template.colors

  return (
    <motion.div
      className={cn(
        'mx-auto w-full max-w-[612px] min-h-[792px] bg-white rounded-lg shadow-2xl overflow-hidden',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div
        className="px-8 py-6 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <h1 className="text-2xl font-bold">
          {personalInfo.firstName || 'Your'}{' '}
          {personalInfo.lastName || 'Name'}
        </h1>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="h-3 w-3" /> LinkedIn
            </span>
          )}
          {personalInfo.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> Portfolio
            </span>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Summary */}
        {summary && (
          <div>
            <SectionHeader title="Professional Summary" icon={Briefcase} color={primary} />
            <p className="text-xs leading-relaxed text-gray-700">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.some((e) => e.company || e.role) && (
          <div>
            <SectionHeader title="Experience" icon={Briefcase} color={primary} />
            <div className="space-y-3">
              {experience
                .filter((e) => e.company || e.role)
                .map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{exp.role}</p>
                        <p className="text-xs text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-[10px] text-gray-500">{exp.duration}</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.responsibilities
                        .filter((r) => r.trim())
                        .map((resp, j) => (
                          <li key={j} className="flex items-start gap-1 text-[11px] text-gray-700">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                            {resp}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.some((e) => e.degree || e.college) && (
          <div>
            <SectionHeader title="Education" icon={GraduationCap} color={primary} />
            <div className="space-y-2">
              {education
                .filter((e) => e.degree || e.college)
                .map((edu, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                      <p className="text-xs text-gray-600">{edu.college}</p>
                    </div>
                    <div className="text-right">
                      {edu.graduationYear && (
                        <p className="text-[10px] text-gray-500">{edu.graduationYear}</p>
                      )}
                      {edu.gpa && (
                        <p className="text-[10px] text-gray-500">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionHeader title="Skills" icon={Wrench} color={primary} />
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${primary}15`,
                    color: primary,
                  }}
                >
                  {skill.name}
                  <span className="text-[8px] opacity-60">• {skill.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.some((p) => p.title) && (
          <div>
            <SectionHeader title="Projects" icon={FolderKanban} color={primary} />
            <div className="space-y-2">
              {projects
                .filter((p) => p.title)
                .map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold text-gray-900">{proj.title}</p>
                      {proj.link && (
                        <span className="text-[10px]" style={{ color: primary }}>
                          Link
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-0.5 text-[11px] text-gray-700">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {proj.technologies.split(',').map((tech, j) => (
                          <span
                            key={j}
                            className="rounded px-1.5 py-0.5 text-[9px] font-medium text-gray-600"
                            style={{ backgroundColor: `${accent}20` }}
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.some((c) => c.name) && (
          <div>
            <SectionHeader title="Certifications" icon={Award} color={primary} />
            <div className="space-y-1.5">
              {certifications
                .filter((c) => c.name)
                .map((cert, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      <span className="text-xs font-medium text-gray-900">
                        {cert.name}
                      </span>
                      {cert.issuer && (
                        <span className="text-[10px] text-gray-500">
                          — {cert.issuer}
                        </span>
                      )}
                    </div>
                    {cert.date && (
                      <span className="text-[10px] text-gray-500">{cert.date}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!summary &&
          !experience.some((e) => e.company || e.role) &&
          !education.some((e) => e.degree || e.college) &&
          skills.length === 0 &&
          !projects.some((p) => p.title) &&
          !certifications.some((c) => c.name) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Briefcase className="h-8 w-8" style={{ color: `${primary}60` }} />
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Start filling in your details to see a live preview of your resume.
              </p>
            </div>
          )}
      </div>
    </motion.div>
  )
}
