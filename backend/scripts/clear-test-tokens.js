import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function clearTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Register models
    await import("../models/UserDevice.model.js");
    await import("../models/User.model.js");

    const testUserId = "69688023f9f93e1e5895554d";

    // Clear from UserDevice
    const deviceResult = await mongoose
      .model("UserDevice")
      .deleteMany({ userId: testUserId });
    console.log(
      `Cleared ${deviceResult.deletedCount} devices for user ${testUserId}`,
    );

    // Clear from User model
    const userResult = await mongoose
      .model("User")
      .findByIdAndUpdate(testUserId, {
        $set: { fcmTokens: [], fcmTokenMobile: [] },
      });

    if (userResult) {
      console.log(`Cleared FCM tokens from User record for ${testUserId}`);
    } else {
      console.log(`User ${testUserId} not found`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
}

clearTokens();
