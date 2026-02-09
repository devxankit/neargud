import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.model.js';
import connectDB from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const data = [
    {
        name: "Fashion",
        icon: "https://cdn-icons-png.flaticon.com/512/3050/3050239.png",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800",
        subcategories: [
            { name: "Men's", icon: "https://cdn-icons-png.flaticon.com/512/3534/3534312.png", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=800" },
            { name: "Women's", icon: "https://cdn-icons-png.flaticon.com/512/3532/3532824.png", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800" },
            { name: "Kids", icon: "https://cdn-icons-png.flaticon.com/512/1329/1329415.png", image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=800" },
            { name: "Tailor", icon: "https://cdn-icons-png.flaticon.com/512/527/527995.png", image: "https://images.unsplash.com/photo-1520004481444-d4b38d388e63?q=80&w=800" },
            { name: "Bootique", icon: "https://cdn-icons-png.flaticon.com/512/751/751613.png", image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800" }
        ]
    },
    {
        name: "Shoes",
        icon: "https://cdn-icons-png.flaticon.com/512/2742/2742687.png",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
        subcategories: [
            { name: "Men's", icon: "https://cdn-icons-png.flaticon.com/512/3534/3534312.png", image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800" },
            { name: "Women's", icon: "https://cdn-icons-png.flaticon.com/512/3532/3532824.png", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800" },
            { name: "Kids", icon: "https://cdn-icons-png.flaticon.com/512/1329/1329415.png", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800" }
        ]
    },
    {
        name: "Hotel & Restaurants",
        icon: "https://cdn-icons-png.flaticon.com/512/1046/1046788.png",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800",
        subcategories: [
            { name: "Cafe", icon: "https://cdn-icons-png.flaticon.com/512/2734/2734035.png", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800" },
            { name: "Restaurants", icon: "https://cdn-icons-png.flaticon.com/512/1046/1046788.png", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800" },
            { name: "Pub", icon: "https://cdn-icons-png.flaticon.com/512/931/931949.png", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800" },
            { name: "Hotel Stay", icon: "https://cdn-icons-png.flaticon.com/512/2983/2983791.png", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" },
            { name: "Banquet Hall", icon: "https://cdn-icons-png.flaticon.com/512/7037/7037563.png", image: "https://images.unsplash.com/photo-1505373633562-b2d976868d4a?q=80&w=800" },
            { name: "Party Hall", icon: "https://cdn-icons-png.flaticon.com/512/1161/1161670.png", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=800" }
        ]
    },
    {
        name: "Mobiles & Accessories",
        icon: "https://cdn-icons-png.flaticon.com/512/644/644458.png",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800",
        subcategories: [
            { name: "Mobiles", icon: "https://cdn-icons-png.flaticon.com/512/644/644458.png", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800" },
            { name: "Accessories", icon: "https://cdn-icons-png.flaticon.com/512/911/911409.png", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800" },
            { name: "Tablets", icon: "https://cdn-icons-png.flaticon.com/512/1118/1118991.png", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1523206489230-c012cda44a5b?q=80&w=800" }
        ]
    },
    {
        name: "Beauty Shops & Cosmetics",
        icon: "https://cdn-icons-png.flaticon.com/512/3059/3059293.png",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800"
    },
    {
        name: "Real Estate",
        icon: "https://cdn-icons-png.flaticon.com/512/602/602190.png",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800",
        subcategories: [
            { name: "Construction", icon: "https://cdn-icons-png.flaticon.com/512/2830/2830310.png", image: "https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=800" },
            { name: "Buy", icon: "https://cdn-icons-png.flaticon.com/512/1063/1063374.png", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800" },
            { name: "Rent", icon: "https://cdn-icons-png.flaticon.com/512/2361/2361131.png", image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800" },
            { name: "Plots", icon: "https://cdn-icons-png.flaticon.com/512/3068/3068652.png", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800" },
            { name: "Properties", icon: "https://cdn-icons-png.flaticon.com/512/602/602190.png", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1448630360428-65426d194e41?q=80&w=800" }
        ]
    },
    {
        name: "Electronic & Appliances",
        icon: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800",
        subcategories: [
            { name: "Laptops", icon: "https://cdn-icons-png.flaticon.com/512/428/428001.png", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800" },
            { name: "TVs", icon: "https://cdn-icons-png.flaticon.com/512/3165/3165243.png", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800" },
            { name: "Refrigerators", icon: "https://cdn-icons-png.flaticon.com/512/2357/2357947.png", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800" },
            { name: "Washing Machines", icon: "https://cdn-icons-png.flaticon.com/512/3074/3074558.png", image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=800" },
            { name: "Computers", icon: "https://cdn-icons-png.flaticon.com/512/3067/3067451.png", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800" }
        ]
    },
    {
        name: "Bags",
        icon: "https://cdn-icons-png.flaticon.com/512/2904/2904844.png",
        image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800"
    },
    {
        name: "Saloon & Spa",
        icon: "https://cdn-icons-png.flaticon.com/512/2707/2707142.png",
        image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=800"
    },
    {
        name: "Jewelleries",
        icon: "https://cdn-icons-png.flaticon.com/512/1216/1216649.png",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800"
    },
    {
        name: "Gyms / Yoga",
        icon: "https://cdn-icons-png.flaticon.com/512/2548/2548530.png",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800"
    },
    {
        name: "Interior Design",
        icon: "https://cdn-icons-png.flaticon.com/512/1531/1531607.png",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800",
        subcategories: [
            { name: "Home Interior", icon: "https://cdn-icons-png.flaticon.com/512/1531/1531607.png", image: "https://images.unsplash.com/photo-1616486341351-7025244f6bb1?q=80&w=800" },
            { name: "Modular Kitchen", icon: "https://cdn-icons-png.flaticon.com/512/2275/2275468.png", image: "https://images.unsplash.com/photo-1556911220-e15206da6389?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800" }
        ]
    },
    {
        name: "Event Management",
        icon: "https://cdn-icons-png.flaticon.com/512/5433/5433983.png",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800"
    },
    {
        name: "Healthcare",
        icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800",
        subcategories: [
            { name: "Eye", icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", image: "https://images.unsplash.com/photo-1576671081837-49000fa12735?q=80&w=800" },
            { name: "Skin", icon: "https://cdn-icons-png.flaticon.com/512/3059/3059293.png", image: "https://images.unsplash.com/photo-1559839734-2b71f1e3c770?q=80&w=800" },
            { name: "Dental", icon: "https://cdn-icons-png.flaticon.com/512/2818/2818366.png", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800" },
            { name: "IVF", icon: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png", image: "https://images.unsplash.com/photo-1579152276516-e575796a849d?q=80&w=800" },
            { name: "Patholab", icon: "https://cdn-icons-png.flaticon.com/512/3063/3063174.png", image: "https://images.unsplash.com/photo-1579152276516-e575796a849d?q=80&w=800" },
            { name: "Multispeciality", icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800" },
            { name: "Medical", icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800" },
            { name: "Blood Bank", icon: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", image: "https://images.unsplash.com/photo-1615461066841-6116ecaabb04?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800" }
        ]
    },
    {
        name: "Education",
        icon: "https://cdn-icons-png.flaticon.com/512/201/201614.png",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800",
        subcategories: [
            { name: "Coaching", icon: "https://cdn-icons-png.flaticon.com/512/3534/3534312.png", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800" },
            { name: "College & University", icon: "https://cdn-icons-png.flaticon.com/512/201/201614.png", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800" },
            { name: "School", icon: "https://cdn-icons-png.flaticon.com/512/167/167707.png", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800" },
            { name: "All", icon: "https://cdn-icons-png.flaticon.com/512/711/711319.png", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800" }
        ]
    },
    {
        name: "Bakery & Cake",
        icon: "https://cdn-icons-png.flaticon.com/512/992/992747.png",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800"
    },
    {
        name: "Home Decor",
        icon: "https://cdn-icons-png.flaticon.com/512/2361/2361131.png",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"
    },
    {
        name: "Influencer",
        icon: "https://cdn-icons-png.flaticon.com/512/2573/2573516.png",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800"
    },
    {
        name: "Furniture",
        icon: "https://cdn-icons-png.flaticon.com/512/2590/2590514.png",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800"
    },
    {
        name: "Car Accessories",
        icon: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
        image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800"
    },
    {
        name: "Gift Shop",
        icon: "https://cdn-icons-png.flaticon.com/512/1170/1170611.png",
        image: "https://images.unsplash.com/photo-1549465220-1d8c9d9c4749?q=80&w=800"
    },
    {
        name: "Pet & Feeds",
        icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800"
    },
    {
        name: "Eye Wear",
        icon: "https://cdn-icons-png.flaticon.com/512/3616/3616524.png",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800"
    },
    {
        name: "Watches",
        icon: "https://cdn-icons-png.flaticon.com/512/864/864685.png",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800"
    }
];

const seedComprehensive = async () => {
    try {
        await connectDB();
        console.log('Connected to Database');

        // Enable debugging if needed
        // mongoose.set('debug', true);

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Upsert Main Category
            const parent = await Category.findOneAndUpdate(
                { name: item.name, parentId: null },
                {
                    icon: item.icon,
                    image: item.image,
                    description: `Main category for ${item.name}`,
                    isActive: true,
                    order: i + 1,
                    parentId: null
                },
                { upsert: true, new: true }
            );

            console.log(`Parent Category: ${parent.name} (ID: ${parent._id})`);

            // Upsert Subcategories if any
            if (item.subcategories && item.subcategories.length > 0) {
                for (let j = 0; j < item.subcategories.length; j++) {
                    const sub = item.subcategories[j];
                    await Category.findOneAndUpdate(
                        { name: sub.name, parentId: parent._id },
                        {
                            icon: sub.icon,
                            image: sub.image,
                            description: `${sub.name} under ${parent.name}`,
                            isActive: true,
                            order: j + 1,
                            parentId: parent._id
                        },
                        { upsert: true }
                    );
                    console.log(`  -> Subcategory: ${sub.name}`);
                }
            }
        }

        console.log('Comprehensive Seeding Completed Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during comprehensive seeding:', error);
        process.exit(1);
    }
};

seedComprehensive();
