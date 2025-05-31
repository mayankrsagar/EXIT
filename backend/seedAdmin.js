// backend/seedAdmin.js
import { config } from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';

config();

(async () => {
  try {
    await mongoose.connect("mongodb+srv://mayankrsagar:exit@exit.cswni6d.mongodb.net/EXIT?retryWrites=true&w=majority&appName=EXIT");
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      // Create with role = HR
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'HR',
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
