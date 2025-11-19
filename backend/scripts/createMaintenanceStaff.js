const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function createMaintenanceStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('Connected to MongoDB');

    // Create multiple maintenance staff members
    const maintenanceStaffData = [
      {
        name: 'John Electrician',
        email: 'john.electrician@fixitnow.com',
        password: 'maintenance123',
        role: 'maintenance',
        department: 'Electrical',
        phone: '123-456-7891',
        categories: ['electrical'],
        isActive: true
      },
      {
        name: 'Sarah Plumber',
        email: 'sarah.plumber@fixitnow.com',
        password: 'maintenance123',
        role: 'maintenance',
        department: 'Plumbing',
        phone: '123-456-7892',
        categories: ['plumbing'],
        isActive: true
      },
      {
        name: 'Mike Carpenter',
        email: 'mike.carpenter@fixitnow.com',
        password: 'maintenance123',
        role: 'maintenance',
        department: 'Carpentry',
        phone: '123-456-7893',
        categories: ['furniture'],
        isActive: true
      },
      {
        name: 'Lisa IT Specialist',
        email: 'lisa.it@fixitnow.com',
        password: 'maintenance123',
        role: 'maintenance',
        department: 'IT',
        phone: '123-456-7894',
        categories: ['wifi'],
        isActive: true
      },
      {
        name: 'Tom Maintenance',
        email: 'tom.maintenance@fixitnow.com',
        password: 'maintenance123',
        role: 'maintenance',
        department: 'General Maintenance',
        phone: '123-456-7895',
        categories: ['electrical', 'plumbing', 'furniture', 'heating', 'cleaning', 'other'],
        isActive: true
      }
    ];

    console.log('Creating maintenance staff members...\n');

    for (const staffData of maintenanceStaffData) {
      // Delete existing user with same email
      await User.findOneAndDelete({ email: staffData.email });
      
      // Create new maintenance staff
      const staff = new User(staffData);
      await staff.save();
      
      console.log(`✅ Created: ${staffData.name} (${staffData.email})`);
      console.log(`   Department: ${staffData.department}`);
      console.log(`   Categories: ${staffData.categories.join(', ')}\n`);
    }

    // Verify all maintenance staff
    const allMaintenanceStaff = await User.find({ role: 'maintenance', isActive: true });
    console.log(`\n🎉 Total maintenance staff in database: ${allMaintenanceStaff.length}`);
    
    console.log('\n📋 All Maintenance Staff:');
    allMaintenanceStaff.forEach(staff => {
      console.log(`   - ${staff.name} (${staff.email}) - ${staff.department}`);
    });

    console.log('\n🔑 Login credentials for all maintenance staff:');
    console.log('   Password: maintenance123');
    console.log('\n   You can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createMaintenanceStaff();
