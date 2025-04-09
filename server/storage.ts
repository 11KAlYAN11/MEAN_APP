import { users, type User, type InsertUser, todos, type Todo, type InsertTodo } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private todos: Map<number, Todo>;
  sessionStore: session.Store;
  private userCurrentId: number;
  private todoCurrentId: number;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.userCurrentId = 1;
    this.todoCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Todo methods
  async getTodosByUserId(userId: number): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(
      (todo) => todo.userId === userId,
    );
  }

  async getTodoById(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(todoData: InsertTodo & { userId: number }): Promise<Todo> {
    const id = this.todoCurrentId++;
    const todo: Todo = {
      ...todoData,
      id,
      completed: false,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, data: Partial<InsertTodo>): Promise<Todo> {
    const existingTodo = this.todos.get(id);
    if (!existingTodo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    const updatedTodo: Todo = {
      ...existingTodo,
      ...data,
    };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    if (!this.todos.has(id)) {
      throw new Error(`Todo with id ${id} not found`);
    }
    this.todos.delete(id);
  }
}

// Export a singleton instance
export const storage = new MemStorage();
