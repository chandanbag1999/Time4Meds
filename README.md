# Time4Meds

Time4Meds is a medication scheduling and reminder application designed to help users keep track of their medication regimens. The application features authentication with email, social providers, and a convenient PIN system for quick access.

## Project Structure

The project is divided into two main components:

- **Frontend**: React application built with Vite, TypeScript, and Tailwind CSS
- **Backend**: Node.js server using Express and MongoDB

## Features

- **User Authentication**: Email OTP, Google, and GitHub authentication via Clerk
- **PIN System**: Set up and use a PIN for quick access to the application
- **Medication Tracking**: Schedule and track medication intake
- **Dashboard**: View medication schedule and history

## Getting Started

### Prerequisites

- Node.js v22.0.0 or higher
- MongoDB (local or MongoDB Atlas)
- Clerk account for authentication services

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/time4meds.git
cd time4meds
```

2. Set up environment variables

Frontend (create `.env` in the frontend directory):
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Backend (create `.env` in the backend directory):
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

### Installation and Running

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

#### Backend

```bash
cd backend
npm install
npm run dev
```

The backend API will be available at http://localhost:3000

## Authentication Flow

1. **Sign Up**: Users can create an account using their name and email
2. **Sign In**: Users can sign in with email OTP, Google, or GitHub
3. **PIN Setup**: After first authentication, users are prompted to set up a PIN
4. **PIN Login**: For subsequent logins, users can use their PIN for quick access

## Technologies Used

### Frontend
- React 19
- TypeScript
- React Router 7
- Redux Toolkit
- Clerk Auth
- Tailwind CSS
- Shadcn UI Components
- Vite

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- TypeScript
- Nodemon for development

## Development

### Frontend Structure

- `src/App.tsx`: Main application component
- `src/routes/`: Application routes
- `src/components/`: Reusable UI components
- `src/store/`: Redux store configuration

### Backend Structure

- `src/index.ts`: Entry point
- `src/routes/`: API routes
- `src/models/`: Database models
- `src/controllers/`: Business logic

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Your Name - your.email@example.com 