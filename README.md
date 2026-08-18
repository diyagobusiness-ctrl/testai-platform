# TestAi - Multi-Tenant Education Platform

A comprehensive multi-tenant SaaS platform for education and upskilling with three user roles (Super Admin, Tenant Admin, Student) featuring voice-based practice, coding challenges, resume building, job hunting, and aptitude testing.

## Features

### Student Portal
- **Voice AI** - Practice interviews with AI-powered voice recognition and face detection
- **Y-Codes** - Solve coding challenges with live execution in multiple languages
- **Job Hunt** - Find and apply to jobs with smart filters
- **Resume Craft** - Build ATS-friendly resumes with 5 professional templates
- **Aptitude Arena** - Practice quantitative, logical reasoning, and verbal ability

### Tenant Admin Dashboard
- Manage students (CRUD, bulk import)
- Add/edit questions for aptitude tests
- Manage job listings
- View analytics and reports

### Super Admin Dashboard
- Manage tenants (create, suspend, reactivate)
- View platform-wide analytics
- Manage subscriptions and billing

## Tech Stack

### Frontend
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Three.js (React Three Fiber) for 3D elements
- Motion (Framer Motion) for animations
- Zustand for state management
- Shadcn UI components

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL
- Redis
- JWT authentication
- Zod validation

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-repo/testai.git
cd testai
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

5. Start the development servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Docker Compose

```bash
docker-compose up -d
```

This will start:
- Frontend on port 3000
- Backend on port 5000
- PostgreSQL on port 5432
- Redis on port 6379

## Project Structure

```
testai/
├── frontend/                 # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   │   ├── 3d/          # Three.js components
│   │   │   ├── animations/  # Animation components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # UI components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # Global styles
│   └── package.json
│
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── migrations/      # Database migrations
│   └── package.json
│
└── docker-compose.yml
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Super Admin
- `POST /api/super-admin/tenants` - Create tenant
- `GET /api/super-admin/tenants` - List tenants
- `PUT /api/super-admin/tenants/:id` - Update tenant
- `POST /api/super-admin/tenants/:id/suspend` - Suspend tenant

### Tenant Admin
- `GET /api/tenant/students` - List students
- `POST /api/tenant/students` - Create student
- `POST /api/tenant/students/bulk` - Bulk import students
- `PUT /api/tenant/students/:id` - Update student

### Student
- `GET /api/student/dashboard` - Get dashboard data
- `GET /api/student/profile` - Get profile
- `POST /api/student/exam/start` - Start exam
- `POST /api/student/exam/submit` - Submit exam

## Theme Features

### 3D Elements
- Animated 3D background with floating education elements
- Interactive 3D hero section
- Particle system for visual interest

### Animations
- Page transitions with smooth fading
- Card hover effects with 3D rotation
- Button glow effects
- Staggered list animations
- Progress ring animations

### Color Scheme
- Primary: Vibrant Blue (#6366f1)
- Secondary: Teal (#14b8a6)
- Accent: Purple (#c084fc)
- Success: Green (#22c55e)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Deployment

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@testai.com or join our Slack channel.
