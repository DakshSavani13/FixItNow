const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email: 'sarthak1@gmail.com' });
    
    if (user) {
      console.log('❌ User STILL EXISTS in database:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   ID: ${user._id}`);
    } else {
      console.log('✅ User NOT FOUND in database (successfully deleted)');
    }

    // List all maintenance staff
    console.log('\n📋 All Maintenance Staff in Database:');
    const allStaff = await User.find({ role: 'maintenance' }).select('name email isActive');
    allStaff.forEach(s => {
      console.log(`   - ${s.name} (${s.email}) - ${s.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUser();
