● Onboard-Me

  AI-Powered Personalized Onboarding Platform - Automated and adaptive training for enterprises.

  🚀 Overview

  Onboard-Me revolutionizes employee onboarding by leveraging AI to automatically generate personalized        
  training content. The platform uses intelligent agents to create structured learning paths, generate
  educational content, and provide real-time analytics for HR teams.

  ✨ Key Features

  - 🤖 AI-Powered Content Generation: Automatic creation of training modules and quizzes
  - 📊 Real-time Analytics: Track user progress and engagement metrics
  - 👥 User Management: Complete admin dashboard for managing learners
  - 🎯 Adaptive Learning: Personalized learning paths based on user progress
  - 🔐 Secure Authentication: JWT-based auth with Row Level Security
  - 📱 Responsive Design: Modern UI/UX for both admin and user interfaces

  🏗️ Architecture

  The project consists of:
  - Admin Frontend: React/TypeScript dashboard for HR teams
  - User Frontend: React/TypeScript learning interface
  - Backend API: FastAPI with AI agent orchestration
  - Database: Supabase (PostgreSQL + Auth + Storage)
  - AI Agents: LangGraph + LLM for content generation

  🛠️ Tech Stack

  Frontend

  - React 18 + TypeScript
  - Tailwind CSS + Shadcn/ui
  - React Router
  - Recharts for analytics

  Backend

  - FastAPI (Python)
  - LangGraph for AI orchestration
  - Supabase client

  Database & Auth

  - Supabase (PostgreSQL)
  - Row Level Security (RLS)
  - JWT Authentication

  📋 Prerequisites

  - Node.js 18+ and npm/yarn
  - Python 3.9+
  - Supabase account
  - Any LLM API key (Groq, Llama, Mistral, OpenAI, Antrhopic...)

  🚀 Getting Started

  1. Clone the Repository

  git clone https://github.com/GitHamza0206/onboard-me.git
  cd onboard-me

  2. Backend Setup

  Install Dependencies

  cd backend
  pip install -r requirements.txt

  Environment Variables

  Create a .env file in the backend directory:

  # Supabase Configuration
  SUPABASE_URL=your_supabase_project_url
  SUPABASE_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

  # GROQ Configuration
  GROQ_API_KEY=your_groq_api_key

  # CORS Configuration
  FRONTEND_URL=http://localhost:3000
  ADMIN_URL=http://localhost:3001

  Database Setup

  1. Create a new Supabase project
  2. Run the SQL migrations in backend/migrations/ (if available)
  3. Set up Row Level Security policies

  Run Backend

  cd backend
  uvicorn src.main:app --reload --port 8000

  The API will be available at http://localhost:8000

  3. Admin Frontend Setup

  Install Dependencies

  cd admin
  npm install

  Environment Variables

  Create a .env file in the admin directory:

  VITE_API_URL=http://localhost:8000
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

  Run Admin Frontend

  npm run dev

  The admin dashboard will be available at http://localhost:3001

  4. User Frontend Setup

  Install Dependencies

  cd app
  npm install

  Environment Variables

  Create a .env file in the app directory:

  VITE_API_URL=http://localhost:8000
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

  Run User Frontend

  npm run dev

  The user interface will be available at http://localhost:3000

  🐳 Docker Setup (Alternative)

  If you prefer using Docker:

  # Build and run all services
  docker-compose up --build

  # Or run in detached mode
  docker-compose up -d

  Services will be available at:
  - User App: http://localhost:3000
  - Admin Dashboard: http://localhost:3001
  - Backend API: http://localhost:8000

  📊 Database Schema

  Key Tables

  - profiles - User profiles and authentication data
  - formations - Training courses created by admins
  - modules - Course modules with learning content
  - quizzes - Assessment quizzes for each module
  - user_formations - User-course assignments
  - user_quiz_attempts - Quiz completion tracking
  - managed_users - Admin-user relationships

  🤖 AI Agents

  Structure Creator Agent

  - Analyzes user prompts for training requirements
  - Generates structured learning paths
  - Creates module and sub-module hierarchies

  Content Generator Agent

  - Automatically creates lesson content
  - Generates contextual quizzes
  - Ensures educational quality and coherence

  🔐 Authentication Flow

  1. Admin Registration: Create admin accounts via /auth/signup/admin
  2. User Creation: Admins create user accounts through the dashboard
  3. Login: JWT-based authentication for both admin and users
  4. Authorization: Role-based access with Supabase RLS

  📈 Usage

  For Administrators

  1. Sign up for an admin account
  2. Access the admin dashboard
  3. Create training courses using AI generation
  4. Manage users and assign courses
  5. Monitor progress through analytics

  For Users

  1. Receive login credentials from admin
  2. Access assigned training courses
  3. Complete modules and quizzes
  4. Track personal progress