# Todo List Application - Quick Setup Guide

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- MongoDB (Cloud or local installation)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
SESSION_SECRET=your_session_secret_key
```

Replace the MongoDB URI with your connection string. You can use MongoDB Atlas or a local MongoDB instance.

### 3. Create Admin User

Run this command to create an admin user:

```bash
npx tsx scripts/add-admin-user.ts
```

This creates a user with:
- Username: `admin`
- Password: `admin`

### 4. Run the Application

Start the application:

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## License

[MIT](LICENSE)