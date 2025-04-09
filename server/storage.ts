import { users, type User, type InsertUser, todos, type Todo, type InsertTodo } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { pool } from "./db";

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Interface defining storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo operations
  getTodosByUserId(userId: number): Promise<Todo[]>;
  getTodoById(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo & { userId: number }): Promise<Todo>;
  updateTodo(id: number, data: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

// Database implementation of storage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Todo methods
  async getTodosByUserId(userId: number): Promise<Todo[]> {
    return await db.select().from(todos).where(eq(todos.userId, userId));
  }

  async getTodoById(id: number): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo;
  }

  async createTodo(todoData: InsertTodo & { userId: number }): Promise<Todo> {
    const [todo] = await db.insert(todos).values({
      ...todoData,
      completed: false
    }).returning();
    return todo;
  }

  async updateTodo(id: number, data: Partial<InsertTodo>): Promise<Todo> {
    const [updatedTodo] = await db.update(todos)
      .set(data)
      .where(eq(todos.id, id))
      .returning();
    
    if (!updatedTodo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    const result = await db.delete(todos).where(eq(todos.id, id));
    // In database implementations, no results means the item wasn't found
    // but we don't need to explicitly check for existence first
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
