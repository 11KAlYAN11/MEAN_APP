# TaskMaster - Todo List Application

A full-stack PERN (PostgreSQL, Express, React, Node.js) application for managing todos with user authentication.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete todos
- Filter todos by status (all, active, completed)
- Set todo priorities (low, medium, high)
- Responsive design

## Tech Stack

- **Frontend**:
  - React.js
  - Tailwind CSS with shadcn/ui components
  - TanStack Query for data fetching
  - Zod for form validation
  - Wouter for routing

- **Backend**:
  - Node.js with Express.js
  - Passport.js for authentication
  - Express sessions for session management

- **Database**:
  - PostgreSQL
  - Drizzle ORM for database operations

## Prerequisites

Before running this application locally, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL (v14 or later)

## Setup and Installation

### Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder-name>
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
SESSION_SECRET=your_session_secret_key
```

Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database>` with your PostgreSQL credentials.

### Database Setup

1. Create a PostgreSQL database for the application:

```bash
psql -c "CREATE DATABASE taskmaster;"
```

2. Push the database schema:

```bash
npm run db:push
```

3. Create an admin user (optional):

```bash
npx tsx scripts/add-admin-user.ts
```

This will create a user with:
- Username: `admin`
- Password: `admin`

**Note:** If the scripts directory doesn't exist, create it and add the admin user script:

```bash
mkdir -p scripts
```

Create a file `scripts/add-admin-user.ts` with the following content:

```typescript
import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await storage.getUserByUsername("admin");
    
    if (existingUser) {
      console.log("Admin user already exists!");
      return;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword("admin");
    const adminUser = await storage.createUser({
      username: "admin",
      password: hashedPassword,
    });
    
    console.log("Admin user created successfully:", adminUser);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
createAdminUser();
```

## Running the Application

### Development Mode

#### Option 1: Single Command Setup (Combined Server)

Start the application in development mode with a single command:

```bash
npm run dev
```

This runs the Express server at http://localhost:5000, which also serves the frontend through Vite's middleware.

#### Option 2: Advanced Development Setup (Recommended for Local Development)

For a better development experience, you can run the server and client separately:

1. **Install concurrently** (one-time setup):
   ```bash
   npm install -g concurrently
   ```

2. **Run the server in watch mode:**
   ```bash
   npx tsx watch server/index.ts
   ```

3. **In a separate terminal, run the Vite development server:**
   ```bash
   npx vite
   ```

   This will start the Vite development server, typically on http://localhost:3000 or another available port.

With this setup, you get:
- Hot module replacement for the frontend
- Automatic server restarts when backend code changes
- Better error reporting for both frontend and backend

### Production Build

For a production build:

```bash
npm run build
npm start
```

This builds the frontend assets and compiles the server, then starts the application in production mode.

## Project Structure

```
├── client/            # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── pages/       # Page components
│   │   └── ...
├── server/            # Backend Express application
│   ├── auth.ts        # Authentication setup
│   ├── db.ts          # Database connection
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Data storage operations
│   └── ...
├── shared/            # Shared code (types, schemas)
│   └── schema.ts      # Database schema and types
├── scripts/           # Utility scripts
└── ...
```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/logout` - Logout a user
- `GET /api/user` - Get the current user

### Todos

- `GET /api/todos` - Get all todos for the current user
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `PATCH /api/todos/:id` - Partially update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your PostgreSQL service is running:
   ```bash
   sudo service postgresql status  # Linux
   brew services list              # macOS
   ```

2. Check your connection string in `.env`:
   ```
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
   ```
   
3. Test the connection directly:
   ```bash
   psql postgres://<username>:<password>@<host>:<port>/<database>
   ```

### Authentication Issues

If login or registration fails:

1. Clear browser cookies and try again
2. Check if the session store is properly configured
3. Verify that the admin user exists:
   ```bash
   psql -d <database> -c "SELECT * FROM users;"
   ```

### Fresh Install

If you need to start fresh:

1. Delete existing tables:
   ```bash
   psql -d <database> -c "DROP TABLE IF EXISTS todos, users, session CASCADE;"
   ```

2. Rebuild the schema:
   ```bash
   npm run db:push
   ```

3. Recreate the admin user:
   ```bash
   npx tsx scripts/add-admin-user.ts
   ```

## License

[MIT](LICENSE)