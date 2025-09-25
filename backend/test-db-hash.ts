import { comparePassword } from './src/middleware/auth';

async function testDBHash() {
  try {
    const plainPassword = 'password123';
    const dbHash = '$2b$10$1uUQg20N51Xy0DrnJqcnReTcNbAOmgC8QWuFMPgFG/VrZKi6wB8Ka';
    
    const isValid = await comparePassword(plainPassword, dbHash);
    console.log('Password "password123" matches database hash:', isValid);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDBHash();
