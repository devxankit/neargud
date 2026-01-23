import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv BEFORE importing other services
dotenv.config({ path: path.join(__dirname, "../.env") });

async function sendTestPush() {
  try {
    // Dynamically import firebaseService so it picks up the .env variables
    const { default: firebaseService } =
      await import("../services/firebase.service.js");
    const { default: mongoose } = await import("mongoose");

    // Connect to DB (needed for firebaseService to find devices)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const testUserId = "69688023f9f93e1e5895554d"; // Valid user found in DB

    console.log(`Sending test push notification to user: ${testUserId}`);

    const result = await firebaseService.sendPushNotification({
      userId: testUserId,
      userModel: "User",
      title: "Test Notification",
      message: "This is a test push notification from Neargud backend!",
      type: "system",
      priority: "high",
      clickAction: "/app/notifications",
    });

    console.log("Push notification result:", result);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error sending test push:", error);
  }
}

sendTestPush();
