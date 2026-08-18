# TestAi - Complete Implementation Plan with Excellent Theming

## 1. PROJECT OVERVIEW

**Platform:** TestAi - Multi-Tenant Education & Skill-Up SaaS  
**Theme:** Modern, futuristic with 3D elements and smooth animations  
**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + Three.js + Motion

---

## 2. THEMING ARCHITECTURE

### 2.1 Visual Design System

**Color Palette (OKLCH):**
```css
:root {
  --primary: oklch(0.65 0.25 265);      /* Vibrant Blue */
  --primary-light: oklch(0.75 0.2 265);  /* Light Blue */
  --secondary: oklch(0.7 0.2 180);       /* Teal */
  --accent: oklch(0.75 0.25 320);        /* Purple */
  --success: oklch(0.7 0.2 145);         /* Green */
  --warning: oklch(0.8 0.2 85);          /* Amber */
  --error: oklch(0.65 0.25 25);          /* Red */
  
  /* Dark Mode */
  --bg-dark: oklch(0.15 0.02 265);
  --surface-dark: oklch(0.2 0.02 265);
  --text-dark: oklch(0.95 0 0);
}
```

**Typography:**
- Primary: Inter (sans-serif)
- Code: JetBrains Mono (monospace)
- Display: Space Grotesk (headings)

### 2.2 3D Elements

**Landing Page:**
- Animated 3D education-themed background (floating books, graduation caps, code symbols)
- Interactive 3D hero section with rotating platform
- Particle system for visual interest

**Dashboard:**
- 3D card hover effects (subtle rotation on hover)
- Animated progress rings (3D depth)
- Floating notification badges with depth

**Voice AI Module:**
- 3D waveform visualization with depth
- Animated microphone icon with glow effects
- Face detection overlay with 3D bounding boxes

### 2.3 Animation System

**Page Transitions:**
```tsx
// Using Motion (Framer Motion successor)
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Micro-interactions:**
- Button hover: Scale + glow effect
- Card hover: 3D tilt + shadow expansion
- Form input focus: Border glow animation
- Loading states: Skeleton shimmer + pulse

**Scroll Animations:**
- GSAP ScrollTrigger for landing page sections
- Intersection Observer for dashboard widgets
- Staggered list animations

---

## 3. PROJECT STRUCTURE

```
testai/
├── frontend/                          # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                       # App Router
│   │   │   ├── layout.tsx             # Root layout with providers
│   │   │   ├── page.tsx               # Landing page (3D hero)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/                 # Super Admin
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   ├── tenants/
│   │   │   │   ├── billing/
│   │   │   │   └── access-control/
│   │   │   └── [tenant]/              # Tenant routes
│   │   │       ├── admin/
│   │   │       │   ├── layout.tsx
│   │   │       │   ├── dashboard/
│   │   │       │   ├── students/
│   │   │       │   ├── content/
│   │   │       │   └── settings/
│   │   │       └── student/
│   │   │           ├── layout.tsx
│   │   │           ├── dashboard/
│   │   │           ├── voice-ai/
│   │   │           ├── y-codes/
│   │   │           ├── job-hunt/
│   │   │           ├── resume-craft/
│   │   │           └── aptitude-arena/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # Shadcn UI components
│   │   │   ├──3d/                     # 3D components
│   │   │   │   ├── Scene.tsx          # Three.js scene wrapper
│   │   │   │   ├── Background.tsx     # Animated 3D background
│   │   │   │   ├── FloatingElements.tsx
│   │   │   │   └── Particles.tsx
│   │   │   ├── animations/            # Animation components
│   │   │   │   ├── PageTransition.tsx
│   │   │   │   ├── CardHover.tsx
│   │   │   │   ├── ButtonGlow.tsx
│   │   │   │   ├── LoadingPulse.tsx
│   │   │   │   └── StaggerList.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── features/
│   │   │       ├── VoiceAI/
│   │   │       ├── YCodes/
│   │   │       ├── JobHunt/
│   │   │       ├── ResumeCraft/
│   │   │       └── AptitudeArena/
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTenant.ts
│   │   │   ├── useAnimation.ts
│   │   │   └── use3D.ts
│   │   │
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── tenantSlice.ts
│   │   │   └── uiSlice.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── public/
│   │   ├── models/                    # 3D models (GLTF)
│   │   └── textures/
│   │
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 Landing Page (3D Hero)

**Components:**
```tsx
// components/3d/Background.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

export function Background3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <Float speed={2} rotationIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#6366f1"
            attach="material"
            distort={0.4}
            speed={2}
          />
        </mesh>
      </Float>
      <Particles count={100} />
    </Canvas>
  )
}
```

**Landing Page Features:**
- Animated 3D education elements (books, code brackets, graduation caps)
- Particle system with interaction
- Scroll-triggered section reveals
- Animated statistics counters
- 3D feature cards with hover effects

### 4.2 Dashboard Animations

**Card Component:**
```tsx
// components/animations/CardHover.tsx
'use client'
import { motion } from 'motion/react'

interface CardHoverProps {
  children: React.ReactNode
  className?: string
}

export function CardHover({ children, className }: CardHoverProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        rotateX: 5,
        rotateY: -5,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}
```

**Animated Progress Ring:**
```tsx
// components/animations/ProgressRing.tsx
'use client'
import { motion } from 'motion/react'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90">
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="stroke-primary"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  )
}
```

### 4.3 Voice AI Animations

**3D Waveform Visualizer:**
```tsx
// components/VoiceAI/Waveform3D.tsx
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WaveformBars() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 64
  
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    for (let i = 0; i < count; i++) {
      const x = (i - count / 2) * 0.1
      const scaleY = Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.5 + 1
      
      dummy.position.set(x, 0, 0)
      dummy.scale.set(0.05, scaleY, 0.05)
      dummy.updateMatrix()
      
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.5} />
    </instancedMesh>
  )
}

export function Waveform3D() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <WaveformBars />
    </Canvas>
  )
}
```

**Face Detection Overlay:**
```tsx
// components/VoiceAI/FaceDetectionOverlay.tsx
'use client'
import { motion, AnimatePresence } from 'motion/react'

interface FaceDetectionProps {
  isDetected: boolean
  warningLevel: 'none' | 'low' | 'high'
  warningCount: number
}

export function FaceDetectionOverlay({
  isDetected,
  warningLevel,
  warningCount
}: FaceDetectionProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Face detection bounding box */}
      <AnimatePresence>
        {isDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-48 h-64 border-2 border-green-500 rounded-lg"
          />
        )}
      </AnimatePresence>

      {/* Warning banner */}
      <AnimatePresence>
        {warningLevel !== 'none' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg
                       ${warningLevel === 'high' 
                         ? 'bg-red-500/90 text-white' 
                         : 'bg-yellow-500/90 text-black'}`}
          >
            {warningLevel === 'high' 
              ? 'Face not detected - Please face camera'
              : 'Unusual movement detected - Stay still'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning counter */}
      {warningCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-4 right-4 bg-red-500 text-white 
                     px-3 py-1 rounded-full text-sm font-bold"
        >
          Warnings: {warningCount}/5
        </motion.div>
      )}
    </div>
  )
}
```

### 4.4 Y-Codes Animations

**Code Editor with Syntax Highlighting:**
```tsx
// components/YCodes/CodeEditor.tsx
'use client'
import { motion } from 'motion/react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  language: string
  code: string
  onChange: (value: string) => void
}

export function CodeEditor({ language, code, onChange }: CodeEditorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl overflow-hidden border border-border
                 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Language selector */}
      <div className="absolute top-4 right-4 z-10">
        <motion.select
          whileHover={{ scale: 1.05 }}
          className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium"
          value={language}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </motion.select>
      </div>

      <Editor
        height="400px"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          padding: { top: 20 },
        }}
        onChange={onChange}
      />
    </motion.div>
  )
}
```

### 4.5 Aptitude Arena Animations

**Question Card with Transitions:**
```tsx
// components/AptitudeArena/QuestionCard.tsx
'use client'
import { motion, AnimatePresence } from 'motion/react'

interface QuestionCardProps {
  question: {
    id: string
    text: string
    options: { a: string; b: string; c: string; d: string }
  }
  selectedAnswer: string | null
  onSelectAnswer: (answer: string) => void
  questionIndex: number
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionIndex
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-2xl p-6 shadow-xl"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold mb-6"
        >
          {question.text}
        </motion.h2>

        <div className="space-y-3">
          {Object.entries(question.options).map(([key, value], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectAnswer(key)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors
                         ${selectedAnswer === key
                           ? 'border-primary bg-primary/10'
                           : 'border-border hover:border-primary/50'}`}
            >
              <span className="font-medium mr-3">{key.toUpperCase()})</span>
              {value}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

### 4.6 Resume Craft Animations

**Multi-Step Form with Transitions:**
```tsx
// components/ResumeCraft/StepTransition.tsx
'use client'
import { motion, AnimatePresence } from 'motion/react'

interface StepTransitionProps {
  currentStep: number
  children: React.ReactNode
}

export function StepTransition({ currentStep, children }: StepTransitionProps) {
  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: currentStep > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: currentStep > 0 ? -100 : 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

**Template Preview with 3D Effect:**
```tsx
// components/ResumeCraft/TemplatePreview.tsx
'use client'
import { motion } from 'motion/react'

interface TemplatePreviewProps {
  template: 'blue' | 'green' | 'red' | 'black' | 'purple'
  isSelected: boolean
  onClick: () => void
}

export function TemplatePreview({ template, isSelected, onClick }: TemplatePreviewProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
    black: 'from-gray-800 to-black',
    purple: 'from-purple-500 to-purple-700',
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        rotateY: 10,
        rotateX: -5,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg
                 ${isSelected ? 'ring-4 ring-primary ring-offset-2' : ''}`}
      style={{ perspective: 1000 }}
    >
      <div className={`h-40 bg-gradient-to-br ${colors[template]}`} />
      <div className="p-4 bg-card">
        <h3 className="font-medium capitalize">{template} Template</h3>
        <p className="text-sm text-muted-foreground">25 credits</p>
      </div>
    </motion.div>
  )
}
```

---

## 5. BACKEND IMPLEMENTATION

### 5.1 API Structure

**Authentication Routes:**
```typescript
// backend/src/routes/auth.ts
import express from 'express'
import { 
  register, 
  login, 
  logout, 
  refreshToken 
} from '../controllers/authController'
import { validateRequest } from '../middleware/validation'
import { authSchema } from '../utils/validators'

const router = express.Router()

router.post('/register', validateRequest(authSchema.register), register)
router.post('/login', validateRequest(authSchema.login), login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)

export default router
```

**Super Admin Routes:**
```typescript
// backend/src/routes/superAdmin.ts
import express from 'express'
import { 
  createTenant,
  getTenants,
  updateTenant,
  suspendTenant
} from '../controllers/tenantController'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

router.use(authenticate)
router.use(authorize('SUPER_ADMIN'))

router.post('/tenants', createTenant)
router.get('/tenants', getTenants)
router.put('/tenants/:id', updateTenant)
router.post('/tenants/:id/suspend', suspendTenant)

export default router
```

### 5.2 Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

**Tenants Table:**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  subscription_plan VARCHAR(20) DEFAULT 'TRIAL',
  max_students INTEGER DEFAULT 50,
  current_students_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_active ON tenants(is_active);
```

**Students Table:**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMP,
  total_credits INTEGER DEFAULT 100,
  current_credits INTEGER DEFAULT 100,
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_user ON students(user_id);
```

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Foundation (Weeks 1-4)
**Priority:** CRITICAL

- [ ] Project setup (Next.js 16, Tailwind 4, TypeScript)
- [ ] Authentication system (JWT, roles)
- [ ] Multi-tenant architecture
- [ ] Base UI components (Shadcn)
- [ ] 3D scene setup (React Three Fiber)
- [ ] Animation system (Motion)
- [ ] Database schema (PostgreSQL)
- [ ] Docker setup

### Phase 2: Admin Dashboards (Weeks 5-8)
**Priority:** HIGH

- [ ] Super Admin Dashboard with animations
- [ ] Tenant Admin Dashboard
- [ ] Student management (CRUD)
- [ ] Billing & subscriptions
- [ ] Animated charts (Recharts)
- [ ] Dashboard widgets with 3D effects

### Phase 3: Core Student Features (Weeks 9-14)
**Priority:** HIGH

- [ ] Student Dashboard with animated widgets
- [ ] Aptitude Arena with question transitions
- [ ] Resume Craft with template previews
- [ ] Job Hunt with card animations
- [ ] PDF generation (html2pdf.js)

### Phase 4: Advanced Features (Weeks 15-20)
**Priority:** MEDIUM-HIGH

- [ ] Voice AI with 3D waveform
- [ ] Face detection overlay
- [ ] Y-Codes with code editor
- [ ] Live code execution
- [ ] Analytics with animated charts

### Phase 5: Polish & Launch (Weeks 21-24)
**Priority:** HIGH

- [ ] Performance optimization
- [ ] Animation performance tuning
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment (Docker, Kubernetes)
- [ ] Monitoring setup

---

## 7. PERFORMANCE OPTIMIZATION

### Animation Performance
1. **GPU-Accelerated Properties:** Only animate `transform` and `opacity`
2. **Lazy Loading:** Use `next/dynamic` for 3D scenes
3. **Bundle Splitting:** Code-split by route
4. **Image Optimization:** Next.js Image component with WebP

### 3D Performance
1. **Instanced Meshes:** Reuse geometry for similar objects
2. **Level of Detail:** Reduce polygon count for distant objects
3. **Framerate Limiting:** Cap at 60fps for non-interactive scenes
4. **Offscreen Canvas:** Use worker threads for complex calculations

### Code Splitting
```typescript
// Lazy load 3D components
const Background3D = dynamic(() => import('./components/3d/Background'), {
  ssr: false,
  loading: () => <div className="h-screen bg-gradient-to-br from-primary/20 to-secondary/20" />
})

// Lazy load heavy features
const VoiceAI = dynamic(() => import('./components/features/VoiceAI'), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />
})
```

---

## 8. DEPLOYMENT

### Docker Configuration
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/testai
      - REDIS_URL=redis://redis:6379

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/testai
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=testai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 9. SUCCESS METRICS

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page Load Time | <2s | Lighthouse |
| Animation FPS | 60fps | Chrome DevTools |
| 3D Scene Load | <3s | Performance API |
| API Response | <500ms | Response headers |
| Bundle Size | <200KB | Webpack Analyzer |
| Lighthouse Score | >90 | Lighthouse |

---

## 10. NEXT STEPS

1. **Initialize Project:** `npx create-next-app@latest testai`
2. **Install Dependencies:** Three.js, Motion, Shadcn, Tailwind
3. **Setup Database:** PostgreSQL with Prisma/Drizzle
4. **Build Landing Page:** 3D hero with animations
5. **Implement Auth:** JWT with role-based access
6. **Start Phase 1:** Foundation work

---

**Ready to build TestAi with stunning visuals! 🚀**
