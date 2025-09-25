import { hashPassword, comparePassword } from './src/middleware/auth';

async function testPassword() {
  try {
    const plainPassword = 'password123';
    
    // Hash the password
    const hash = await hashPassword(plainPassword);
    console.log('New hash for password123:', hash);
    
    // Test comparison with the new hash
    const isValid = await comparePassword(plainPassword, hash);
    console.log('Comparison with new hash:', isValid);
    
    // Test with the hash from database (from our earlier check)
    const dbHash = '$2b$10$1uU'; // This is incomplete, let's get the full one
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();
