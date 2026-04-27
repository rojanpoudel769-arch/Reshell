/**
 * One-time seed script to create the admin account.
 * Run with: node backend/scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@gmail.com' });
        if (existing) {
            console.log('Admin account already exists. Skipping seed.');
            process.exit(0);
        }

        await User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'Admin@123',
            role: 'admin',
            isVerified: true,
        });

        console.log('✅ Admin account created successfully!');
        console.log('   Email   : admin@gmail.com');
        console.log('   Password: Admin@123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedAdmin();
