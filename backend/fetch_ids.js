import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
        process.exit(1);
    }
};

const ProductSchema = new mongoose.Schema({
    name: String,
    vendorId: mongoose.Schema.Types.ObjectId,
});
const Product = mongoose.model('Product', ProductSchema);

const fetchIds = async () => {
    await connectDB();
    const products = await Product.find().limit(5);
    products.forEach(p => {
        console.log(`PRODUCT_ID=${p._id}, VENDOR_ID=${p.vendorId}, NAME=${p.name}`);
    });
    process.exit();
};

fetchIds();
