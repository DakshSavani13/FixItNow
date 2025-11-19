const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function verifyMaintenanceStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB\n');

    // Find all maintenance staff
    const maintenanceStaff = await User.find({ role: 'maintenance', isActive: true })
      .select('name email phone categories department');

    console.log('📊 Maintenance Staff Query Results:\n');
    console.log(`Total maintenance staff found: ${maintenanceStaff.length}\n`);

    if (maintenanceStaff.length === 0) {
      console.log('⚠️  No maintenance staff found!');
      console.log('Run: node scripts/createMaintenanceStaff.js\n');
    } else {
      console.log('📋 Maintenance Staff List:\n');
      maintenanceStaff.forEach((staff, index) => {
        console.log(`${index + 1}. ${staff.name}`);
        console.log(`   Email: ${staff.email}`);
        console.log(`   Department: ${staff.department || 'N/A'}`);
        console.log(`   Phone: ${staff.phone || 'N/A'}`);
        console.log(`   Categories: ${staff.categories?.join(', ') || 'None'}`);
        console.log(`   ID: ${staff._id}`);
        console.log('');
      });
    }

    // Also check for admin/staff users
    const adminUsers = await User.find({ role: 'admin' }).select('name email');
    const staffUsers = await User.find({ role: 'staff' }).select('name email');
    
    console.log(`\n👥 Other Users:`);
    console.log(`   Admins: ${adminUsers.length}`);
    adminUsers.forEach(u => console.log(`      - ${u.name} (${u.email})`));
    console.log(`   Staff: ${staffUsers.length}`);
    staffUsers.forEach(u => console.log(`      - ${u.name} (${u.email})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyMaintenanceStaff();
