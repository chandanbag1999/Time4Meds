# Time4Meds

<div align="center">
  <img src="https://i.imgur.com/hJ7LMbH.png" alt="Time4Meds Logo" width="120" />
  <h3>Never Miss a Dose</h3>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-blue?style=for-the-badge)](https://time4-meds.vercel.app/)
  ![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
  ![Node](https://img.shields.io/badge/Node-Express-green?style=flat-square&logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-5-green?style=flat-square&logo=mongodb)
</div>

## 📱 Application Preview

<div align="center">
  <img src="https://i.imgur.com/WiQNLYI.png" alt="Time4Meds Landing Page" width="80%" />
</div>

## 🚀 Overview

Time4Meds is a comprehensive medication management system designed to help users track and maintain their medication schedules. With intuitive interfaces and timely reminders, it ensures patients never miss a dose.

## ✨ Features

- **Medication Management** - Add, edit, and track your medications
- **Smart Reminders** - Receive timely notifications for your doses
- **Adherence Tracking** - Monitor your medication adherence over time
- **User Authentication** - Secure login and registration system
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- React Router v7
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Node-cron for scheduled reminders

## 🚦 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chandanbag1999/Time4Meds.git
cd Time4Meds
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/time4meds
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development servers:
```bash
# In the root directory, run both frontend and backend
npm run dev

# Or run individually:
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

- Frontend will be available at: http://localhost:5173
- Backend API will be available at: http://localhost:5000

## 📊 Project Structure

```
Time4Meds/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── db/              # Database connection
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── jobs/            # Cron jobs
│   │   └── index.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.tsx          # Main application
│   └── package.json
└── package.json
```

## 🔗 API Endpoints

All API endpoints are available under the `/api` base path:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Medicines
- `GET /api/medicines` - Get all medicines for a user
- `POST /api/medicines` - Add a new medicine
- `GET /api/medicines/:id` - Get medicine details
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Reminder Logs
- `GET /api/reminder-logs` - Get all reminder logs
- `GET /api/reminder-logs/summary` - Get adherence summary
- `POST /api/reminder-logs/:id/status` - Update reminder status

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication. All protected routes require a valid token to be included in the Authorization header.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📱 Live Demo

Visit the live application at [https://time4-meds.vercel.app/](https://time4-meds.vercel.app/) 