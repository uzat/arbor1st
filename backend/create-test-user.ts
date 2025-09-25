import db from './src/config/database';
import { hashPassword } from './src/middleware/auth';

async function createTestUser() {
  try {
    const hashedPassword = await hashPassword('password123');
    
    const [user] = await db('users')
      .insert({
        email: 'test@arboriq.com',
        password_hash: hashedPassword,  // Changed from 'password' to 'password_hash'
        first_name: 'Test',
        last_name: 'User',
        role: 'arborist',
        active: true
      })
      .returning('*');
    
    console.log('Test user created successfully!');
    console.log('Email: test@arboriq.com');
    console.log('Password: password123');
    console.log('Role: arborist');
    console.log('User ID:', user.id);
    
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Test user already exists');
      console.log('Email: test@arboriq.com');
      console.log('Password: password123');
    } else {
      console.error('Error creating test user:', error);
    }
    process.exit(1);
  }
}

createTestUser();
