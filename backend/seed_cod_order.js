import mongoose from 'mongoose';
import Order from './models/Order.model.js';
import User from './models/User.model.js';
import Product from './models/Product.model.js';
import DeliveryPartner from './models/DeliveryPartner.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedCodOrder = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        const product = await Product.findOne();
        const deliveryPartner = await DeliveryPartner.findOne();

        if (!user || !product) {
            console.error('Please make sure you have at least one user and one product in the database.');
            process.exit(1);
        }

        const orderData = {
            orderCode: 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            customerId: user._id,
            items: [{
                productId: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
                image: product.images?.[0] || ''
            }],
            total: product.price,
            status: 'delivered',
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            shippingAddress: user.addresses?.[0] || null,
            deliveryPartnerId: deliveryPartner?._id || null,
            customerSnapshot: {
                name: user.firstName + ' ' + (user.lastName || ''),
                email: user.email,
                phone: user.phone
            },
            statusHistory: [{
                status: 'delivered',
                changedBy: user._id,
                changedByRole: 'user',
                timestamp: new Date(),
                note: 'Order delivered'
            }]
        };

        const newOrder = await Order.create(orderData);
        console.log('Test COD Order created successfully:', newOrder.orderCode);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedCodOrder();
