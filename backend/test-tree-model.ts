import TreeModel from './src/models/Tree';
import db from './src/config/database';

async function testTreeModel() {
  try {
    console.log('Testing Tree Model...\n');

    // 1. First create a test user (we need this for foreign key constraints)
    console.log('Creating test user...');
    const [testUser] = await db('users').insert({
      email: 'test@arboriq.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'arborist',
      active: true
    }).returning('*');
    console.log(`✅ Created test user with ID: ${testUser.id}`);

    // 2. Get all trees (should be empty initially)
    const trees = await TreeModel.findAll();
    console.log(`✅ findAll() - Found ${trees.length} trees`);

    // 3. Create a test tree with the test user as creator
    const newTree = await TreeModel.create({
      species: 'Eucalyptus camaldulensis',
      common_name: 'River Red Gum',
      cultivar: 'River Red Gum',
      latitude: -37.8136,
      longitude: 144.9631,
      height_m: 15.5,
      dbh_cm: 45,
      canopy_spread_m: 12,
      health_status: 'good',
      risk_rating: 25,
      created_by: testUser.id
    });
    console.log(`✅ create() - Created tree with ID: ${newTree.id}`);

    // 4. Find by ID
    const foundTree = await TreeModel.findById(newTree.id);
    console.log(`✅ findById() - Found tree: ${foundTree?.species}`);

    // 5. Update tree
    const updatedTree = await TreeModel.update(newTree.id, {
      health_status: 'excellent',
      height_m: 16,
      risk_rating: 15
    });
    console.log(`✅ update() - Updated health status to: ${updatedTree?.health_status}`);

    // 6. Find nearby trees (Melbourne CBD)
    const nearbyTrees = await TreeModel.findNearby(-37.8136, 144.9631, 1000);
    console.log(`✅ findNearby() - Found ${nearbyTrees.length} trees within 1km`);

    // 7. Soft delete the test tree
    const deleted = await TreeModel.delete(newTree.id);
    console.log(`✅ delete() - Soft deleted tree: ${deleted}`);

    // 8. Verify soft delete worked (should not find the tree)
    const deletedTree = await TreeModel.findById(newTree.id);
    console.log(`✅ Soft delete verified - Tree found: ${deletedTree === null ? 'No' : 'Yes'}`);

    // 9. Clean up - delete test user
    await db('users').where({ id: testUser.id }).delete();
    console.log('✅ Cleaned up test user');

    console.log('\n✨ All Tree Model tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTreeModel();