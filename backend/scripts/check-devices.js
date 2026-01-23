import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkDevices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await import("../models/UserDevice.model.js");
    const UserDevice = mongoose.model("UserDevice");

    const userId = "69688023f9f93e1e5895554d";
    const devices = await UserDevice.find({ userId });
    console.log(`Found ${devices.length} devices for user ${userId}`);

    if (devices.length > 0) {
      devices.forEach((d, i) =>
        console.log(`Device ${i}: ${d.fcmToken.substring(0, 10)}...`),
      );
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkDevices();
