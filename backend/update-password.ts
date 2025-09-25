import db from './src/config/database';
import { hashPassword } from './src/middleware/auth';

async function updatePassword() {
  try {
    const newHash = await hashPassword('password123');
    
    const updated = await db('users')
      .where({ email: 'test@arboriq.com' })
      .update({ 
        password_hash: newHash,
        updated_at: new Date()
      });
    
    console.log('Password updated for test@arboriq.com');
    console.log('You can now login with:');
    console.log('Email: test@arboriq.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updatePassword();
