# Time4Meds API

A Node.js backend for a medicine reminder application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/time4meds
     ```

## Running the application

- Development mode:
  ```
  npm run dev
  ```
- Production mode:
  ```
  npm start
  ```

## API Endpoints

### Medicines

- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get a single medicine
- `POST /api/medicines` - Create a new medicine
- `PUT /api/medicines/:id` - Update a medicine
- `DELETE /api/medicines/:id` - Delete a medicine

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv for environment variables
- nodemon for development 