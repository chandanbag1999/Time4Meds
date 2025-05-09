# Time4Meds Backend Server

Express + Node.js 22 + TypeScript backend server for the Time4Meds application.

## Requirements

- Node.js v22 or later
- npm v10 or later

## Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

## Available Scripts

- `npm run build` - Transpile TypeScript to JavaScript
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart on file changes)
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Development

The project uses nodemon for development to automatically restart the server when file changes are detected. The configuration is in `nodemon.json`:

- Watches the `src` directory
- Monitors `.ts` and `.json` file changes
- Ignores test files
- Uses ts-node to run TypeScript files directly

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### API Base
- `GET /api` - API status check

### Examples
- `GET /api/examples` - Get all examples
- `GET /api/examples/:id` - Get example by ID

## Project Structure

```
backend/
├── dist/             # Compiled JavaScript files
├── src/              # TypeScript source files
│   ├── middleware/   # Express middlewares
│   ├── routes/       # API routes
│   └── index.ts      # Entry point
├── .env              # Environment variables (create this)
├── .env.example      # Example environment variables
├── nodemon.json      # Nodemon configuration
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
``` 