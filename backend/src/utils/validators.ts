import { z } from 'zod'

export const authSchema = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),
}

export const tenantSchema = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Tenant name is required'),
      slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
      logoUrl: z.string().url('Invalid URL').optional(),
      subscriptionPlan: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE']).default('TRIAL'),
      maxStudents: z.number().min(1).default(50),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid tenant ID'),
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      logoUrl: z.string().url().optional(),
      subscriptionPlan: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE']).optional(),
      maxStudents: z.number().min(1).optional(),
    }),
  }),
}

export const studentSchema = {
  create: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid student ID'),
    }),
    body: z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
    }),
  }),
}

export const questionSchema = {
  create: z.object({
    body: z.object({
      category: z.enum(['QUANTITATIVE', 'LOGICAL_REASONING', 'VERBAL_ABILITY']),
      questionText: z.string().min(1, 'Question text is required'),
      options: z.object({
        a: z.string().min(1),
        b: z.string().min(1),
        c: z.string().min(1),
        d: z.string().min(1),
      }),
      correctAnswer: z.enum(['a', 'b', 'c', 'd']),
      explanation: z.string().optional(),
      difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
      timeLimitSeconds: z.number().min(1).default(60),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid question ID'),
    }),
    body: z.object({
      questionText: z.string().min(1).optional(),
      options: z.object({
        a: z.string().min(1),
        b: z.string().min(1),
        c: z.string().min(1),
        d: z.string().min(1),
      }).optional(),
      correctAnswer: z.enum(['a', 'b', 'c', 'd']).optional(),
      explanation: z.string().optional(),
      difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
      timeLimitSeconds: z.number().min(1).optional(),
    }),
  }),
}

export const jobSchema = {
  create: z.object({
    body: z.object({
      title: z.string().min(1, 'Job title is required'),
      companyName: z.string().min(1, 'Company name is required'),
      description: z.string().min(1, 'Description is required'),
      requiredSkills: z.array(z.string()).default([]),
      location: z.string().optional(),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).default('FULL_TIME'),
      applicationUrl: z.string().url().optional(),
      deadline: z.string().datetime().optional(),
    }),
  }),
}

export const resumeSchema = {
  create: z.object({
    body: z.object({
      title: z.string().min(1, 'Resume title is required'),
      designId: z.string().uuid('Invalid design ID'),
      content: z.object({
        personalInfo: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          location: z.string().optional(),
          linkedin: z.string().url().optional(),
          portfolio: z.string().url().optional(),
        }),
        summary: z.string().max(200).optional(),
        education: z.array(z.object({
          degree: z.string(),
          college: z.string(),
          gpa: z.number().optional(),
          graduationYear: z.number(),
        })).default([]),
        experience: z.array(z.object({
          company: z.string(),
          role: z.string(),
          startDate: z.string(),
          endDate: z.string().optional(),
          responsibilities: z.array(z.string()).default([]),
        })).default([]),
        skills: z.array(z.object({
          name: z.string(),
          proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
        })).default([]),
        projects: z.array(z.object({
          title: z.string(),
          description: z.string(),
          technologies: z.array(z.string()).default([]),
          link: z.string().url().optional(),
        })).default([]),
        certifications: z.array(z.object({
          name: z.string(),
          issuer: z.string(),
          date: z.string(),
        })).default([]),
      }),
    }),
  }),
}
