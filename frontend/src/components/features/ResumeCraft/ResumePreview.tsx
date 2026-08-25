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
  layout = 'default',
}: {
  title: string
  icon: React.ElementType
  color: string
  layout?: 'default' | 'minimal' | 'accent'
}) {
  if (layout === 'minimal') {
    return (
      <div className="mb-3">
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </h3>
        <div className="mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: color }} />
      </div>
    )
  }

  if (layout === 'accent') {
    return (
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-6 w-1 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </h3>
      </div>
    )
  }

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

function SidebarLayout({
  personalInfo,
  summary,
  education,
  experience,
  skills,
  projects,
  certifications,
  template,
}: {
  personalInfo: PersonalInfo
  summary: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: Skill[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  template: Template
}) {
  const { primary, secondary, accent } = template.colors

  return (
    <div className="flex min-h-[792px]">
      {/* Sidebar */}
      <div
        className="w-48 shrink-0 px-4 py-6 text-white"
        style={{ background: `linear-gradient(180deg, ${primary}, ${secondary})` }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 text-2xl font-bold"
            style={{ backgroundColor: `${primary}40` }}
          >
            {(personalInfo.firstName?.[0] || 'Y')}{(personalInfo.lastName?.[0] || 'N')}
          </div>
          <h1 className="mt-3 text-lg font-bold">
            {personalInfo.firstName || 'Your'}{' '}
            {personalInfo.lastName || 'Name'}
          </h1>
        </div>

        <div className="space-y-3 text-[10px]">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="break-all">{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="h-3 w-3 shrink-0" />
              <span>LinkedIn</span>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 shrink-0" />
              <span>Portfolio</span>
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-6">
            <SectionHeader title="Skills" icon={Wrench} color="white" layout="minimal" />
            <div className="flex flex-wrap gap-1">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-block rounded px-1.5 py-0.5 text-[9px] font-medium bg-white/20"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {certifications.some((c) => c.name) && (
          <div className="mt-6">
            <SectionHeader title="Certifications" icon={Award} color="white" layout="minimal" />
            <div className="space-y-1.5">
              {certifications
                .filter((c) => c.name)
                .map((cert, i) => (
                  <div key={i} className="text-[9px]">
                    <p className="font-medium">{cert.name}</p>
                    {cert.issuer && <p className="opacity-70">{cert.issuer}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 space-y-4">
        {summary && (
          <div>
            <SectionHeader title="Professional Summary" icon={Briefcase} color={primary} layout="accent" />
            <p className="text-[11px] leading-relaxed text-gray-700">{summary}</p>
          </div>
        )}

        {experience.some((e) => e.company || e.role) && (
          <div>
            <SectionHeader title="Experience" icon={Briefcase} color={primary} layout="accent" />
            <div className="space-y-3">
              {experience
                .filter((e) => e.company || e.role)
                .map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-gray-900">{exp.role}</p>
                        <p className="text-[10px] text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-[9px] text-gray-500">{exp.duration}</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.responsibilities
                        .filter((r) => r.trim())
                        .map((resp, j) => (
                          <li key={j} className="flex items-start gap-1 text-[10px] text-gray-700">
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

        {education.some((e) => e.degree || e.college) && (
          <div>
            <SectionHeader title="Education" icon={GraduationCap} color={primary} layout="accent" />
            <div className="space-y-2">
              {education
                .filter((e) => e.degree || e.college)
                .map((edu, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">{edu.degree}</p>
                      <p className="text-[10px] text-gray-600">{edu.college}</p>
                    </div>
                    <div className="text-right">
                      {edu.graduationYear && (
                        <p className="text-[9px] text-gray-500">{edu.graduationYear}</p>
                      )}
                      {edu.gpa && (
                        <p className="text-[9px] text-gray-500">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {projects.some((p) => p.title) && (
          <div>
            <SectionHeader title="Projects" icon={FolderKanban} color={primary} layout="accent" />
            <div className="space-y-2">
              {projects
                .filter((p) => p.title)
                .map((proj, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-bold text-gray-900">{proj.title}</p>
                      {proj.link && (
                        <span className="text-[9px]" style={{ color: primary }}>Link</span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-0.5 text-[10px] text-gray-700">{proj.description}</p>
                    )}
                    {proj.technologies && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {proj.technologies.split(',').map((tech, j) => (
                          <span
                            key={j}
                            className="rounded px-1.5 py-0.5 text-[8px] font-medium text-gray-600"
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
      </div>
    </div>
  )
}

function ClassicLayout({
  personalInfo,
  summary,
  education,
  experience,
  skills,
  projects,
  certifications,
  template,
}: {
  personalInfo: PersonalInfo
  summary: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: Skill[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
  template: Template
}) {
  const { primary, secondary, accent } = template.colors

  return (
    <div className="min-h-[792px]">
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
        {summary && (
          <div>
            <SectionHeader title="Professional Summary" icon={Briefcase} color={primary} />
            <p className="text-xs leading-relaxed text-gray-700">{summary}</p>
          </div>
        )}

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
                        <span className="text-[10px]" style={{ color: primary }}>Link</span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-0.5 text-[11px] text-gray-700">{proj.description}</p>
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
      </div>
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
  const isSidebar = ['professional-navy', 'elegant-black', 'executive-gray', 'minimal-teal'].includes(selectedTemplate)

  return (
    <motion.div
      className={cn(
        'relative mx-auto w-full max-w-[612px] min-h-[792px] bg-white rounded-lg shadow-2xl overflow-hidden',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {isSidebar ? (
        <SidebarLayout
          personalInfo={personalInfo}
          summary={summary}
          education={education}
          experience={experience}
          skills={skills}
          projects={projects}
          certifications={certifications}
          template={template}
        />
      ) : (
        <ClassicLayout
          personalInfo={personalInfo}
          summary={summary}
          education={education}
          experience={experience}
          skills={skills}
          projects={projects}
          certifications={certifications}
          template={template}
        />
      )}

      {/* Empty State */}
      {!summary &&
        !experience.some((e) => e.company || e.role) &&
        !education.some((e) => e.degree || e.college) &&
        skills.length === 0 &&
        !projects.some((p) => p.title) &&
        !certifications.some((c) => c.name) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${template.colors.primary}15` }}
            >
              <Briefcase className="h-8 w-8" style={{ color: `${template.colors.primary}60` }} />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Start filling in your details to see a live preview of your resume.
            </p>
          </div>
        )}
    </motion.div>
  )
}
