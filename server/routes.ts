import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Todo routes - all require authentication
  
  // Get all todos for the current user
  app.get("/api/todos", requireAuth, async (req, res, next) => {
    try {
      const todos = await storage.getTodosByUserId(req.user!.id);
      res.json(todos);
    } catch (err) {
      next(err);
    }
  });

  // Get a specific todo by ID
  app.get("/api/todos/:id", requireAuth, async (req, res, next) => {
    try {
      const todoId = parseInt(req.params.id);
      if (isNaN(todoId)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      const todo = await storage.getTodoById(todoId);
      
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      // Ensure the todo belongs to the current user
      if (todo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  // Create a new todo
  app.post("/api/todos", requireAuth, async (req, res, next) => {
    try {
      // Validate the request body
      const result = insertTodoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid todo data", errors: result.error.errors });
      }

      // Add the current user's ID
      const todo = await storage.createTodo({
        ...result.data,
        userId: req.user!.id,
      });
      
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  });

  // Update a todo
  app.put("/api/todos/:id", requireAuth, async (req, res, next) => {
    try {
      const todoId = parseInt(req.params.id);
      if (isNaN(todoId)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      // Validate the request body
      const result = insertTodoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid todo data", errors: result.error.errors });
      }

      // Check if the todo exists and belongs to the user
      const existingTodo = await storage.getTodoById(todoId);
      if (!existingTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      if (existingTodo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Update the todo
      const updatedTodo = await storage.updateTodo(todoId, result.data);
      res.json(updatedTodo);
    } catch (err) {
      next(err);
    }
  });

  // Update a todo's completion status
  app.patch("/api/todos/:id", requireAuth, async (req, res, next) => {
    try {
      const todoId = parseInt(req.params.id);
      if (isNaN(todoId)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      // Validate the completed field
      const schema = z.object({
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.errors });
      }

      // Check if the todo exists and belongs to the user
      const existingTodo = await storage.getTodoById(todoId);
      if (!existingTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      if (existingTodo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Update the todo
      const updatedTodo = await storage.updateTodo(todoId, result.data);
      res.json(updatedTodo);
    } catch (err) {
      next(err);
    }
  });

  // Delete a todo
  app.delete("/api/todos/:id", requireAuth, async (req, res, next) => {
    try {
      const todoId = parseInt(req.params.id);
      if (isNaN(todoId)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      // Check if the todo exists and belongs to the user
      const existingTodo = await storage.getTodoById(todoId);
      if (!existingTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      if (existingTodo.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Delete the todo
      await storage.deleteTodo(todoId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
