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
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const reelSchema = new mongoose.Schema({
    videoUrl: String,
    thumbnail: String,
    productId: mongoose.Schema.Types.ObjectId,
    vendorId: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'active' },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
}, { timestamps: true });

const Reel = mongoose.model('ReelSeeder', reelSchema, 'reels');

const ProductSchema = new mongoose.Schema({
    name: String,
    vendorId: mongoose.Schema.Types.ObjectId,
});
const Product = mongoose.model('ProductSeeder', ProductSchema, 'products');

const videos = [
    "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-and-singing-4482-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-to-the-music-in-a-park-on-a-sunny-day-4486-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-nightclub-under-flashing-neon-lights-4488-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-singing-and-dancing-in-front-of-a-colorful-background-4492-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-and-singing-in-front-of-a-mirror-4494-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-and-singing-along-to-her-favorite-music-4498-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-a-bright-neon-lit-room-4502-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-to-the-rhythm-in-a-studio-setting-4506-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-performing-a-modern-dance-routine-in-an-urban-setting-4510-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-the-rain-in-a-darkened-alleyway-4514-large.mp4"
];

const seedReels = async () => {
    await connectDB();

    const products = await Product.find().limit(10);

    if (products.length === 0) {
        console.log("No products found in database.");
        process.exit();
    }

    const reelsToInsert = products.map((product, index) => {
        return {
            videoUrl: videos[index % videos.length],
            thumbnail: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            productId: product._id,
            vendorId: product.vendorId,
            status: 'active',
            likes: Math.floor(Math.random() * 5000) + 100,
            views: Math.floor(Math.random() * 50000) + 500,
            comments: Math.floor(Math.random() * 1000) + 10,
        };
    });

    await Reel.insertMany(reelsToInsert);
    console.log(`Successfully seeded ${reelsToInsert.length} reels.`);
    process.exit();
};

seedReels();
