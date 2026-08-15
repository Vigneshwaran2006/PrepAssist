# 🤖 PrepAssist

> An AI-powered placement preparation platform that helps students and job seekers research companies, analyze resumes, identify skill gaps, and build personalized preparation roadmaps.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)
![Tavily](https://img.shields.io/badge/Tavily-Web%20Search-orange)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 Overview

PrepAssist is a full-stack AI-powered platform designed to simplify technical placement preparation.

It combines real-time web research, AI analysis, and resume evaluation to provide company-specific guidance instead of requiring users to search across multiple websites.

## ✨ Features

### Authentication

* Google OAuth login
* Secure JWT authentication
* Refresh token rotation
* Session persistence using httpOnly cookies
* Protected routes
* Multi-device session management

### Resume Management

* Upload PDF and DOCX resumes
* AI-powered resume parsing
* Extract skills, projects, education, experience, and certifications
* ATS compatibility score
* Resume quality score
* Multiple resume versions
* Primary resume selection

### AI Placement Analysis

* Company research using Tavily
* Automatic role extraction from job descriptions
* On-campus / Off-campus analysis
* Duplicate analysis detection
* Background processing
* Real-time analysis status
* AI retry with fallback models

### Analysis Report

* Company details and hiring information
* Drive and interview process
* Company-specific resume suggestions
* Skill gap analysis
* Personalized preparation roadmap
* Learning resources and practice links

### Smart Features

* Company validation
* Job description support
* Resume reuse
* Retry failed analyses
* Delete analyses
* Real-time web research
* Responsive UI
* Toast notifications
* Custom dialogs and loading states

# 🛠 Tech Stack

## Frontend

* Next.js 16
* TypeScript
* Tailwind CSS 4
* Zustand
* Axios
* React Query

## Backend

* Node.js 22
* Express.js
* TypeScript
* JWT
* Passport.js
* Multer
* Helmet.js

## AI & Search

* Google Gemini API
* Gemini Flash
* Gemini Flash Lite
* Tavily API
* Custom retry and fallback logic

## File Processing

* pdf-parse
* mammoth

## Database & Storage

* Supabase PostgreSQL
* Supabase Storage
* Row Level Security
* Signed URLs

## Deployment

* Vercel (Frontend)
* Render (Backend)
* Supabase (Database & Storage)

# 📂 Project Structure

PrepAssist/

├── backend/
│   ├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   │   ├── ai/
│   │   ├── analysis/
│   │   ├── resume/
│   │   └── search/
│   ├── types/
│   └── utils/
│
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   └── dashboard/
│   │       ├── analyses/
│   │       └── resumes/
│   ├── components/
│   ├── lib/
│   ├── stores/
│   └── types/
│
└── README.md

# 🚀 Getting Started

## Prerequisites

* Node.js 22+
* npm
* Supabase Project
* Google OAuth Credentials
* Google Gemini API Key
* Tavily API Key

## Clone Repository

git clone https://github.com/yourusername/PrepAssist.git

cd PrepAssist

## Backend Setup

cd backend

npm install

npm run dev

Create a `.env` file inside the backend directory:

NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

GEMINI_API_KEY=
TAVILY_API_KEY=

## Frontend Setup

cd frontend

npm install

npm run dev

Create a `.env.local` file:

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PrepAssist

## Database Setup

Create the following tables in Supabase:

* users
* sessions
* resumes
* resume_analyses
* analyses

Create a private storage bucket named `resumes` with a 10 MB file size limit.

## Application

Frontend

http://localhost:3000

Backend

http://localhost:5000

# 🔒 Security

* JWT Authentication
* Google OAuth 2.0
* Refresh Token Rotation
* httpOnly Cookies
* SHA-256 Hashed Sessions
* Rate Limiting
* Helmet Security Headers
* Signed File URLs
* File Validation
* Row Level Security
* User Data Isolation
* AI Output Validation

# 🚀 Future Improvements

* Mock coding assessments
* Company-specific OA simulations
* AI-powered mock interviews
* Voice-based interview practice
* Community interview experiences
* Placement readiness tracking
* Email notifications
* Analysis comparison
* Two-factor authentication
* PDF export
* Team and college workspaces
* Mobile application

# ⚠️ Known Limitations

* Gemini free-tier quotas may limit daily analyses
* Tavily free-tier limits monthly searches
* Very small or new companies may fail validation
* Complex multi-column resumes may parse poorly

# 👨‍💻 Author

**Vigneshwaran C**

GitHub: https://github.com/Vigneshwaran2006

LinkedIn: https://www.linkedin.com/in/vigneshwaran2k6/

Email: [vwaran172@gmail.com](mailto:vwaran172@gmail.com)

# 📄 License

This project is licensed under the MIT License.

## ⭐ If PrepAssist helps you prepare for your dream role, consider giving it a star!
