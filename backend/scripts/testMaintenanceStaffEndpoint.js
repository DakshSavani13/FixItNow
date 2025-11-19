const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

async function testEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Find an admin or staff user to generate a token
    let testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      testUser = await User.findOne({ role: 'staff' });
    }
    if (!testUser) {
      testUser = await User.findOne({ role: 'maintenance' });
    }

    if (!testUser) {
      console.log('❌ No admin, staff, or maintenance user found. Creating a test admin...');
      testUser = new User({
        name: 'Test Admin',
        email: 'admin@fixitnow.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      await testUser.save();
      console.log('✅ Test admin created');
    }

    console.log(`\nUsing user: ${testUser.name} (${testUser.role})`);

    // Generate JWT token
    const token = jwt.sign(
      { _id: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    console.log('\n🔑 Generated JWT token');

    // Test the endpoint
    console.log('\n📡 Testing GET /api/admin/maintenance-staff endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/admin/maintenance-staff', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Number of maintenance staff:', response.data.length);
    console.log('\n📋 Maintenance Staff List:');
    
    if (response.data.length === 0) {
      console.log('   ⚠️  No maintenance staff found!');
      console.log('   Run: node scripts/createMaintenanceStaff.js');
    } else {
      response.data.forEach((staff, index) => {
        console.log(`\n   ${index + 1}. ${staff.name}`);
        console.log(`      Email: ${staff.email}`);
        console.log(`      Phone: ${staff.phone || 'N/A'}`);
        console.log(`      Categories: ${staff.categories?.join(', ') || 'None'}`);
      });
    }

    console.log('\n✅ Endpoint is working correctly!');

  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testEndpoint();
