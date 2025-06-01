// backend/seedAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (!existing) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'HR',
      });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
