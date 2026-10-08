import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { populateSeedData } from '../utils/seedData.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Populating seed data...');
    const result = await populateSeedData();
    console.log('✅ Demo seed data populated successfully!');
    console.log(`Categories: ${result.categoriesCount}`);
    console.log(`Products: ${result.productsCount}`);
    console.log(`Users: ${result.usersCount}`);
    console.log(`Banners: ${result.bannersCount}`);
    console.log(`Coupons: ${result.couponsCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

runSeed();
