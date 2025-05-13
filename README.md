# Time4Meds

A full-stack application for managing medicine reminders, with features to track medicine intake and provide timely notifications.

## Project Structure

```
Time4Meds/
├── backend/           # Node.js Express API
│   ├── src/           # Source code
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── frontend/          # Frontend application (to be added)
├── package.json       # Root package.json for project management
└── README.md          # This file
```

## Features

- Medicine management (add, edit, delete)
- Reminder scheduling
- User authentication
- Reminder logs
- Cron jobs for automated reminders

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Time4Meds
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/time4meds
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run server
```

The API will be available at http://localhost:3000

## API Endpoints

All endpoints are available under the `/api` base path:

- `/api/auth` - Authentication (login, register)
- `/api/users` - User management
- `/api/medicines` - Medicine management
- `/api/reminders` - Reminder operations
- `/api/reminder-logs` - Reminder logs

## Documentation

For detailed documentation, refer to the backend and frontend README files.

## License

ISC 