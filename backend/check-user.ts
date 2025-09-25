import db from './src/config/database';

async function checkUser() {
  try {
    const user = await db('users')
      .where({ email: 'test@arboriq.com' })
      .select('id', 'email', 'first_name', 'last_name', 'role', 'password_hash', 'active')
      .first();
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Email:', user.email);
      console.log('Name:', user.first_name, user.last_name);
      console.log('Role:', user.role);
      console.log('Active:', user.active);
      console.log('Has password_hash:', !!user.password_hash);
      console.log('Password hash first 10 chars:', user.password_hash?.substring(0, 10));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
