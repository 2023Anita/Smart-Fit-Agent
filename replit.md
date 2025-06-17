# AI Health Planning Application

## Overview

This is a full-stack web application that provides personalized health and fitness planning using AI. The application consists of a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. It integrates with Google's Gemini AI API to generate customized meal plans and workout routines based on user profiles and health goals.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and health-themed colors
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **AI Integration**: Google Gemini API for health content generation
- **Session Management**: Built-in Express session handling
- **Build System**: ESBuild for production bundling

### Database Design
The application uses PostgreSQL with the following main entities:
- **Users**: Store user profiles including demographics, fitness goals, and health conditions
- **Meal Plans**: Daily meal plans with nutritional information and AI-generated content
- **Workout Plans**: Exercise routines with difficulty levels and calorie burn estimates
- **Daily Progress**: Track user's daily metrics like weight, calories, and activity completion

## Key Components

### User Profile Management
- Comprehensive profile setup including age, gender, height, weight, activity level
- Health conditions and dietary preferences tracking
- Fitness goals (weight loss, muscle gain, maintenance, weight gain)
- Form validation using Zod schemas

### AI-Powered Content Generation
- Meal plan generation based on user preferences and nutritional needs
- Workout routine creation tailored to fitness goals and activity level
- Integration with Gemini AI API for personalized recommendations
- Fallback mechanisms for API failures

### Progress Tracking
- Daily metrics tracking (weight, calories consumed/burned, water intake)
- Visual progress charts and trend analysis
- Weekly and monthly progress aggregation
- Goal achievement monitoring

### Responsive Design
- Mobile-first design approach
- Adaptive navigation with sheet components for mobile
- Progressive enhancement for different screen sizes
- Touch-friendly interface elements

## Data Flow

1. **User Onboarding**: New users complete profile setup form
2. **Profile Processing**: User data is validated and stored in PostgreSQL
3. **AI Content Generation**: Gemini API generates personalized meal and workout plans
4. **Daily Dashboard**: Users view and interact with their daily plans
5. **Progress Updates**: Users log daily activities and metrics
6. **Analytics**: Application tracks progress and provides insights

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (version 16) for data persistence
- **AI Service**: Google Gemini API for content generation
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and validation
- **Date Handling**: date-fns for date manipulation
- **State Management**: TanStack Query for server state synchronization

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- Uses Replit's development environment with hot reloading
- Vite dev server for frontend development
- tsx for TypeScript execution in development
- PostgreSQL module pre-configured in Replit

### Production Build
- Frontend built using Vite with optimized bundle splitting
- Backend compiled using ESBuild for Node.js execution
- Static assets served from Express server
- Database migrations handled via Drizzle Kit

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Gemini API key via `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`
- Session secrets and other configuration via environment variables
- Autoscale deployment target for production scaling

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
- June 17, 2025. Added PostgreSQL database integration with DatabaseStorage
- June 17, 2025. Replaced "Gemini" branding with "健康agent" throughout UI
- June 17, 2025. Successfully deployed with working AI meal/workout generation
- June 17, 2025. Implemented meal photo recognition with Gemini 2.0 Flash Vision API
- June 17, 2025. Created dedicated food tracking page with nutritional analysis
- June 17, 2025. Replaced meal cards with elegant table layout and dropdown menus
- June 17, 2025. Enhanced progress tracking with real-time weight, steps, and water intake
- June 17, 2025. Added comprehensive daily weight tracking with historical trends
- June 17, 2025. Implemented interactive data input for all health metrics
- June 17, 2025. Integrated food tracking with dashboard calorie intake display
- June 17, 2025. Added localStorage persistence for tracked meals across navigation
- June 17, 2025. Implemented dynamic calorie target calculation using BMR/TDEE formulas
- June 17, 2025. Enhanced meal generation with flexible food combinations and variety
- June 17, 2025. Added calorie overflow warnings and source breakdown display
- June 17, 2025. Updated application branding to "Smart Fit Agent"
- June 17, 2025. Implemented step-based calorie calculation (0.04 cal/step) integrated into total calories burned
- June 17, 2025. Added detailed calorie breakdown showing workout calories + step calories separately
- June 17, 2025. Restored multi-user authentication system with email-based registration and login
- June 17, 2025. Added copyright footer "所有权©睡眠魔法师" to application bottom
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```