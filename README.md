# Todo List Application - Quick Setup Guide

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL (v14 or later)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory:

```
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
SESSION_SECRET=your_session_secret_key
```

Replace the placeholders with your PostgreSQL credentials.

### 3. Initialize Database

Create a PostgreSQL database:

```bash
psql -c "CREATE DATABASE taskmaster;"
```

Push the schema to the database:

```bash
npm run db:push
```

### 4. Create Admin User

Run this command to create an admin user:

```bash
npx tsx scripts/add-admin-user.ts
```

This creates a user with:
- Username: `admin`
- Password: `admin`

### 5. Run the Application

Start the application:

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## License

[MIT](LICENSE)