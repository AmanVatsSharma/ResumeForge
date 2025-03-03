# ResumeForge Technical Architecture

## System Architecture
ResumeForge follows a modern full-stack architecture with clear separation of concerns:

```
                                     ┌────────────────┐
                                     │                │
                                     │   Client App   │ (React, TailwindCSS, Shadcn UI)
                                     │                │
                                     └────────┬───────┘
                                              │
                                              │ HTTP/REST
                                              ▼
┌──────────────────┐                ┌────────┴───────┐               ┌────────────────┐
│                  │                │                │               │                │
│   Gemini AI    ◄─┼────────────────┤   Express.js   ├───────────────►   PostgreSQL   │
│     (Google)     │                │     Server     │               │    Database    │
│                  │                │                │               │                │
└──────────────────┘                └────────┬───────┘               └────────────────┘
                                              │
                                              │ HTTP
                                              ▼
                                     ┌────────┴───────┐
                                     │                │
                                     │   PhonePe     │
                                     │   Payments     │
                                     │                │
                                     └────────────────┘
```

## Frontend Architecture

### Component Hierarchy
```
App
├── AuthProvider
│   └── Router
│       ├── HomePage
│       ├── TemplatesPage
│       ├── GeneratorPage
│       │   ├── ResumeForm
│       │   └── ChatPanel
│       ├── ResumePage
│       │   ├── ResumePreview
│       │   └── TemplateControls
│       ├── AuthPage
│       │   ├── LoginForm
│       │   └── RegisterForm
│       └── NotFound
└── Toaster (Notifications)
```

### State Management
- **React Query**: Used for data fetching, caching, and state synchronization
- **React Hook Form**: Manages form state and validation
- **Context API**: Manages authentication state via AuthProvider

### UI Libraries
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI and styled with TailwindCSS
- **Lucide React**: Icon library

## Backend Architecture

### API Layer
- Express.js REST API
- Request validation with Zod
- Authentication middleware

### Database Layer
- PostgreSQL database
- Drizzle ORM for database operations
- Schema defined in shared/schema.ts

### External Services
- Google Gemini API for AI content generation
- PhonePe for payment processing

## Database Schema

### Users Table
```
┌─────────────────┬─────────────┬─────────────────────────┐
│ Column          │ Type        │ Description             │
├─────────────────┼─────────────┼─────────────────────────┤
│ id              │ serial      │ Primary Key             │
│ username        │ text        │ Unique user identifier  │
│ password        │ text        │ Hashed password         │
│ isPremium       │ boolean     │ Premium status flag     │
│ generationCount │ integer     │ Resume count (free tier)│
└─────────────────┴─────────────┴─────────────────────────┘
```

### Resumes Table
```
┌─────────────────┬─────────────┬─────────────────────────┐
│ Column          │ Type        │ Description             │
├─────────────────┼─────────────┼─────────────────────────┤
│ id              │ serial      │ Primary Key             │
│ userId          │ integer     │ Foreign Key to users    │
│ name            │ text        │ Resume name             │
│ content         │ json        │ Resume content          │
│ templateId      │ text        │ Selected template       │
│ createdAt       │ text        │ Creation timestamp      │
└─────────────────┴─────────────┴─────────────────────────┘
```

## API Endpoints

### Authentication
- POST `/api/auth/register`: User registration
- POST `/api/auth/login`: User login
- GET `/api/auth/user`: Get current user
- POST `/api/auth/logout`: User logout

### Resumes
- GET `/api/resumes`: Get user's resumes
- GET `/api/resumes/:id`: Get specific resume
- POST `/api/resumes`: Create new resume
- PATCH `/api/resumes/:id/template`: Update resume template

### AI Features
- POST `/api/ai/generate`: Generate content
- POST `/api/chat`: Chat with AI assistant

### Payments
- POST `/api/payments/initiate`: Initiate payment
- POST `/api/payments/callback`: Payment callback

## Authentication Flow

1. User submits credentials via login/register form
2. Server validates credentials with Passport.js
3. Session is created and stored using express-session
4. Session ID stored in cookie is sent to client
5. Subsequent requests include the cookie for authentication

## Resume Creation Flow

1. User selects a template
2. User fills out resume sections
3. User can request AI assistance for content generation
4. Backend validates and stores the resume
5. User can preview and export the resume

## Data Flow

1. Client makes API requests to Express server
2. Server processes requests and interacts with database
3. For AI features, server makes requests to Google Gemini API
4. For payments, server interacts with PhonePe API
5. Responses are sent back to client for rendering

## Deployment Architecture
Currently designed for single-server deployment with:
- Node.js server hosting both API and serving static files
- PostgreSQL database
- No containerization currently implemented 