# Bug Tracker SaaS

A modern, real-time bug tracking system for teams built with Node.js, React, and Socket.IO.

## Features

- 🏢 Team & Project Management
- 📋 Drag-and-drop Task/Issue Boards
- 👥 Role-based Access Control (Admin/Dev/Tester)
- 🔄 Real-time Updates via Socket.IO
- 📧 Email Notifications
- 💬 Comment Threads & Change Logs
- ✨ Modern UI with Tailwind CSS

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JSON Web Tokens (JWT)
- Nodemailer

### Frontend

- React
- Tailwind CSS
- Socket.IO Client
- React DnD (Drag and Drop)
- React Query

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/bug-tracker.git
cd bug-tracker
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Install frontend dependencies

```bash
cd ../client
npm install
```

4. Create .env files in both server and client directories (see .env.example files)

5. Start the development servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bug-tracker
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## License

MIT License - see LICENSE file for details
