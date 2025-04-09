import { User, Todo } from './mongodb';
import session from "express-session";
import createMemoryStore from "memorystore";

// Import types from shared schema
import type { InsertUser, InsertTodo } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: InsertUser): Promise<any>;
  
  // Todo operations
  getTodosByUserId(userId: string): Promise<any[]>;
  getTodoById(id: string): Promise<any | undefined>;
  createTodo(todo: InsertTodo & { userId: string }): Promise<any>;
  updateTodo(id: string, data: Partial<InsertTodo>): Promise<any>;
  deleteTodo(id: string): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<any | undefined> {
    try {
      const user = await User.findById(id);
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<any> {
    try {
      const user = new User(insertUser);
      await user.save();
      return user.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getTodosByUserId(userId: string): Promise<any[]> {
    try {
      const todos = await Todo.find({ userId });
      return todos.map(todo => todo.toObject());
    } catch (error) {
      console.error('Error getting todos by user ID:', error);
      return [];
    }
  }

  async getTodoById(id: string): Promise<any | undefined> {
    try {
      const todo = await Todo.findById(id);
      return todo ? todo.toObject() : undefined;
    } catch (error) {
      console.error('Error getting todo by ID:', error);
      return undefined;
    }
  }

  async createTodo(todoData: InsertTodo & { userId: string }): Promise<any> {
    try {
      const todo = new Todo(todoData);
      await todo.save();
      return todo.toObject();
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  async updateTodo(id: string, data: Partial<InsertTodo>): Promise<any> {
    try {
      const todo = await Todo.findByIdAndUpdate(id, data, { new: true });
      return todo ? todo.toObject() : undefined;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await Todo.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}

export const storage = new MongoDBStorage();