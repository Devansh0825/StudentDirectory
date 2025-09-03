# Overview

This is a Student Directory application for MCA (Master of Computer Applications) program students. It's a full-stack web application that allows users to browse, search, and filter student profiles. The application displays student information including names, courses, batches, profile photos, and LinkedIn profiles in an organized, searchable interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage with sample data (MemStorage class)
- **Development**: Hot reload with Vite middleware integration

## Database & ORM
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared schema definitions between client and server
- **Validation**: Zod schemas for runtime type checking
- **Migration**: Drizzle Kit for database migrations

## Key Features
- **Student Management**: CRUD operations for student profiles
- **Search & Filter**: Text search, batch filtering, course filtering, and sorting
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: Comprehensive UI component system with consistent theming

## Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Common TypeScript types and schemas
- `/components` - Reusable UI components with shadcn/ui

## Development Workflow
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Integrated Vite dev server with Express API proxy

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Neon database driver for PostgreSQL
- **drizzle-orm**: Modern TypeScript ORM
- **@tanstack/react-query**: Server state management
- **express**: Backend web framework
- **vite**: Frontend build tool and dev server

## UI & Styling
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management
- **clsx**: Conditional className utility

## Development Tools
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **drizzle-kit**: Database schema management and migrations

## External Services
- **Font Awesome**: Icon library via CDN
- **Google Fonts**: Typography (DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Unsplash**: Student profile images
- **LinkedIn**: External profile linking

## Database
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Neon Database**: Serverless PostgreSQL hosting platform