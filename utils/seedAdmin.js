import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const seedAdminUser = async () => {
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await User.create({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hash,
      role: 'admin',
      name: 'Admin'
    });
    console.log('Admin user seeded');
  }
};
