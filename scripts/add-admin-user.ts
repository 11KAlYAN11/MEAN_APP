import { connectToMongoDB, User } from "../server/mongodb";
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
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ username: "admin" });
    
    if (existingUser) {
      console.log("Admin user already exists!");
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await hashPassword("admin");
    const adminUser = new User({
      username: "admin",
      password: hashedPassword,
    });
    
    await adminUser.save();
    
    console.log("Admin user created successfully:", adminUser);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

// Run the function
createAdminUser();