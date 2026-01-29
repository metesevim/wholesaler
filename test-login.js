import prisma from './prisma/client.js';
import bcrypt from 'bcrypt';

(async () => {
  try {
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!admin) {
      console.log('No admin found');
      process.exit(1);
    }

    console.log('Admin found:', admin.username);
    console.log('Testing password...');
    const testPassword = 'admin';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password match:', isMatch);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
})();
