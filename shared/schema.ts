import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
// Traditional Postgres type
// export type User = typeof users.$inferSelect;

// MongoDB compatible type with _id
export type User = {
  _id?: string; // MongoDB ObjectId as string
  id?: number; // Keep for compatibility
  username: string;
  password: string;
};

// Todo schema
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertTodoSchema = createInsertSchema(todos)
  .pick({
    title: true,
    description: true,
    priority: true,
  })
  .extend({
    priority: z.enum(["low", "medium", "high"]).default("medium"),
  });

export type InsertTodo = z.infer<typeof insertTodoSchema>;
// Traditional Postgres type
// export type Todo = typeof todos.$inferSelect;

// MongoDB compatible type with _id
export type Todo = {
  _id?: string; // MongoDB ObjectId as string
  id?: number; // Keep for compatibility
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  userId: string;
};
