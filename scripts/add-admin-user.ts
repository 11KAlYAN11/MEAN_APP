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