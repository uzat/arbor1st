import db from './src/config/database';

async function getHash() {
  const user = await db('users')
    .where({ email: 'test@arboriq.com' })
    .select('password_hash')
    .first();
  console.log('Full password_hash:', user.password_hash);
  process.exit(0);
}

getHash();
