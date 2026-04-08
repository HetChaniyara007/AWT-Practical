# College Event Management System (EventHub)

A modern, Gen-Z oriented full-stack web application for college communities to discover, manage, and register for events. Built with the MERN stack (MongoDB, Express, React, Node.js), Tailwind CSS, and Framer Motion.

## Features
- **Dynamic UI**: Dark-mode first, glassmorphism aesthetics, and fluid animations.
- **Role-Based Access**: Students, Club Admins, and Super Admins.
- **Event Discovery**: Search and filter upcoming technical, cultural, and sports fests.
- **Registration & QR Codes**: Instant virtual ticket generation and capacity waitlisting.
- **Admin Dashboard**: Analytics and management shortcuts.

## Project Structure
The repository is split into two independent parts:
- `/frontend` - React Vite application (UI, Tailwind, Framer Motion)
- `/backend` - Node/Express API server (Mongoose models, JWT Auth)

## Quick Start (Local Development)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and ensure MongoDB is running locally or provide a URI

# Seed the database with mock roles and events
node seed.js

# Start dev server
npm run dev
```

### 2. Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application. 
Use the credentials from `seed.js` to log in as an Admin or Student, or register a new account.

## Built With
- MongoDB & Mongoose
- Express.js
- React.js (Vite)
- Node.js
- Tailwind CSS
- Framer Motion
- Lucide React Icons
