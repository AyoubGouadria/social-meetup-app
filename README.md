# 🎉 Meetly - Social Connection Platform

A full-stack social connection application built with React + TypeScript (Frontend) and Node.js + Express + MongoDB (Backend).

---

## 📁 Project Structure

```
Responsive Social Connection App/
├── 📱 frontend/          Frontend application (React + TypeScript + Vite)
├── 🔧 backend/           Backend API (Node.js + Express + MongoDB)
├── 📂 node_modules/      (Legacy - can be deleted)
├── 📄 .gitignore         Git ignore rules
└── 📄 README.md          This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Setup Frontend

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env
# Edit .env with your backend URL (default: http://localhost:5000/api)

# Start development server
npm run dev
# Frontend will run on http://localhost:5173
```

### 2. Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
# Backend will run on http://localhost:5000
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Documentation**: See `backend/QUICK_START.md`

---

## 📚 Documentation

### Frontend Documentation
Located in `frontend/` folder:
- **[README.md](frontend/README.md)** - Frontend overview
- **[FRONTEND_ORGANIZATION.md](frontend/FRONTEND_ORGANIZATION.md)** - Code organization guide
- **[ARCHITECTURE_DIAGRAMS.md](frontend/ARCHITECTURE_DIAGRAMS.md)** - Visual architecture
- **[APPLICATION_ANALYSIS.md](frontend/APPLICATION_ANALYSIS.md)** - Technical analysis
- **[USER_FLOWS.md](frontend/USER_FLOWS.md)** - User interaction flows
- **[QUICK_REFERENCE.md](frontend/QUICK_REFERENCE.md)** - Developer quick reference
- **[DEVELOPER_GUIDE.md](frontend/DEVELOPER_GUIDE.md)** - Development guide
- **[FRONTEND_BACKEND_INTEGRATION.md](frontend/FRONTEND_BACKEND_INTEGRATION.md)** - Integration guide

### Backend Documentation
Located in `backend/` folder:
- **[README.md](backend/README.md)** - Backend overview
- **[QUICK_START.md](backend/QUICK_START.md)** - Setup and API reference
- **[BACKEND_SETUP.md](backend/BACKEND_SETUP.md)** - Detailed setup guide
- **[BACKEND_COMPLETE.md](backend/BACKEND_COMPLETE.md)** - Complete implementation

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI
- **Routing**: React Router 7.13.0
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **File Upload**: Multer + Cloudinary

---

## ✨ Features

### User Features
- 🔐 Authentication (Register, Login, Profile Management)
- 👤 User Profiles with customization
- 🌍 Multi-language support (English, German, Arabic)
- 🔔 Real-time notifications

### Event Management
- 📅 Create and browse events
- 🔍 Filter by category, language, location
- 👥 Join requests system
- 💬 Real-time chat for events
- 📍 Location-based features

### Social Interaction
- 🤝 Join requests (send, accept, reject)
- 💭 Event chat rooms
- 🔔 Activity notifications
- 👥 Participant management

---

## 🏗️ Development Workflow

### Frontend Development
```powershell
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend Development
```powershell
cd backend
npm run dev      # Start with nodemon
npm start        # Start production server
```

### Full Stack Development
Open two terminal windows:
1. Terminal 1: `cd frontend && npm run dev`
2. Terminal 2: `cd backend && npm run dev`

---

## 📦 Project Features

### Frontend Structure
```
frontend/src/
├── app/                  Main application code
│   ├── components/       Reusable UI components
│   ├── pages/           Page components
│   ├── contexts/        React contexts
│   └── utils/           Utilities
├── services/            API integration layer
├── hooks/               Custom React hooks
├── lib/                 Shared utilities
├── styles/              CSS files
└── types/               TypeScript definitions
```

### Backend Structure
```
backend/src/
├── config/              Configuration (DB, JWT, Cloudinary)
├── models/              Mongoose schemas
├── controllers/         Business logic
├── routes/              API routes
├── middleware/          Express middleware
├── socket/              WebSocket handlers
├── utils/               Helper functions
├── app.js              Express app setup
└── server.js           Server entry point
```

---

## 🧪 Testing

### Test API Endpoints
```powershell
# Using Invoke-RestMethod (PowerShell)
Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method GET

# Using curl
curl http://localhost:5000/api/events
```

---

## 🔒 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Meetly
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meetly
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚨 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or for port 5173 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### MongoDB Connection Issues
- Check if MongoDB is running: `mongod --version`
- Verify connection URI in `.env`
- Try MongoDB Atlas if local setup fails

### Module Not Found
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

## 📝 License

This project is for educational purposes.

---

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 🎯 Next Steps

- [ ] Setup frontend environment
- [ ] Setup backend environment
- [ ] Configure MongoDB
- [ ] Test API endpoints
- [ ] Connect frontend to backend
- [ ] Deploy to production

---

## 📞 Support

For detailed setup instructions:
- Frontend: See `frontend/QUICK_START.md`
- Backend: See `backend/QUICK_START.md`
- Integration: See `frontend/FRONTEND_BACKEND_INTEGRATION.md`

---

**Happy Coding! 🚀**
