import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const userDeviceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  fcmToken: String,
});

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

async function findActiveDevice() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const devices = await UserDevice.find({ isActive: true }).limit(5);
    if (devices.length === 0) {
      console.log("No active devices found");
    } else {
      console.log("Found active devices:");
      devices.forEach((d) => {
        console.log(
          `User ID: ${d.userId}, Token: ${d.fcmToken.substring(0, 10)}...`,
        );
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

findActiveDevice();
