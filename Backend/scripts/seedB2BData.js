require('dotenv').config();
const mongoose = require('mongoose');
const B2BCompany = require('../models/B2BCompany');
const B2BJob = require('../models/B2BJob');
const B2BWallet = require('../models/B2BWallet');
const B2BWalletTransaction = require('../models/B2BWalletTransaction');
const B2BInvoice = require('../models/B2BInvoice');
const B2BEngineerAssignment = require('../models/B2BEngineerAssignment');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting B2B Database seeding...');
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Clean existing seeded data to prevent duplicates
    await B2BCompany.deleteMany({ email: { $in: ['partner@wbi.in', 'techsolve@wbi.in'] } });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 2. Create the Corporate Partner company (TechSolve Pvt. Ltd.)
    const company = await B2BCompany.create({
      companyName: 'TechSolve Pvt. Ltd.',
      gstNumber: '27TECHSOLV1234Z',
      panNumber: 'TECHSOL123',
      tanNumber: 'TAN1234567',
      cinNumber: 'U72200MH2025PTC123456',
      logoUrl: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=100&h=100&q=80',
      companyAddress: '404, Tech Tower, Hiranandani, Powai, Mumbai, MH - 400076',
      billingAddress: '404, Tech Tower, Hiranandani, Powai, Mumbai, MH - 400076',
      branches: [
        {
          branchName: 'Mumbai HQ',
          branchAddress: 'Hiranandani, Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
          contactPerson: 'Aditya Sen'
        },
        {
          branchName: 'Pune Depot',
          branchAddress: 'Kalyani Nagar',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411006',
          contactPerson: 'Amit Patil'
        },
        {
          branchName: 'Navi Mumbai Hub',
          branchAddress: 'Vashi Sector 17',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400703',
          contactPerson: 'Vikram Rao'
        },
        {
          branchName: 'Thane Branch',
          branchAddress: 'Ghodbunder Road',
          city: 'Thane',
          state: 'Maharashtra',
          pincode: '400607',
          contactPerson: 'Rahul Nair'
        }
      ],
      authorizedPerson: {
        name: 'TechSolve Partner',
        designation: 'Super Admin',
        email: 'techsolve@wbi.in',
        phone: '9876543210'
      },
      email: 'techsolve@wbi.in',
      phone: '9876543210',
      passwordHash,
      verificationStatus: 'approved',
      isActive: true,
      walletBalance: 154320
    });

    console.log(`Created Company: ${company.companyName} (ID: ${company._id})`);

    // Clean existing database records linked to this company ID
    await B2BJob.deleteMany({ companyId: company._id });
    await B2BWallet.deleteMany({ companyId: company._id });
    await B2BWalletTransaction.deleteMany({ companyId: company._id });
    await B2BInvoice.deleteMany({ companyId: company._id });
    await B2BEngineerAssignment.deleteMany({ companyId: company._id });

    // 3. Create wallet
    const wallet = await B2BWallet.create({
      companyId: company._id,
      balance: 154320
    });
    console.log(`Created Wallet balance: ₹${wallet.balance}`);

    // 4. Create technical engineers list (for the /b2b/engineers route)
    const engineers = await B2BEngineerAssignment.insertMany([
      { companyId: company._id, engineerName: 'Rahul Sharma', phone: '9001234501', email: 'rahul.s@wbi.in', skills: ['AC Repair', 'HVAC'], status: 'Active' },
      { companyId: company._id, engineerName: 'Suresh Yadav', phone: '9001234502', email: 'suresh.y@wbi.in', skills: ['Plumbing', 'Drainage'], status: 'Active' },
      { companyId: company._id, engineerName: 'Amit Singh', phone: '9001234503', email: 'amit.s@wbi.in', skills: ['Electrician', 'Wiring'], status: 'Active' },
      { companyId: company._id, engineerName: 'Vikas Patel', phone: '9001234504', email: 'vikas.p@wbi.in', skills: ['Pest Control', 'Sanitization'], status: 'Active' },
      { companyId: company._id, engineerName: 'Karan Mehta', phone: '9001234505', email: 'karan.m@wbi.in', skills: ['Washing Machine', 'Appliances'], status: 'Active' }
    ]);
    console.log(`Seeded ${engineers.length} technical engineers.`);

    // 5. Seed Jobs
    // Seed exact May 2025 jobs from reference screenshot
    const screenshotJobs = [
      { jobId: 'JOB-1250', service: 'AC Repair', location: 'Navi Mumbai', priority: 'High', assignedTo: 'Rahul Sharma', status: 'in_progress', charge: 4500, date: new Date('2025-05-31T10:30:00') },
      { jobId: 'JOB-1249', service: 'Plumbing', location: 'Pune', priority: 'Medium', assignedTo: 'Suresh Yadav', status: 'completed', charge: 2200, date: new Date('2025-05-31T16:00:00') },
      { jobId: 'JOB-1248', service: 'Electrician', location: 'Thane', priority: 'Low', assignedTo: 'Amit Singh', status: 'in_progress', charge: 1800, date: new Date('2025-05-30T11:00:00') },
      { jobId: 'JOB-1247', service: 'Pest Control', location: 'Mumbai', priority: 'High', assignedTo: 'Vikas Patel', status: 'pending', charge: 3500, date: new Date('2025-05-30T09:30:00') },
      { jobId: 'JOB-1246', service: 'Washing Machine', location: 'Navi Mumbai', priority: 'Medium', assignedTo: 'Karan Mehta', status: 'completed', charge: 2800, date: new Date('2025-05-29T14:00:00') }
    ];

    // Seed more jobs spread across May 2025 to generate nice chart trendlines
    const extraMayJobs = [];
    const servicesList = ['AC Repair', 'Plumbing', 'Electrician', 'Pest Control', 'Washing Machine'];
    const locationsList = ['Mumbai', 'Pune', 'Navi Mumbai', 'Thane'];
    const prioritiesList = ['Low', 'Medium', 'High'];
    const statusesList = ['completed', 'in_progress', 'pending'];
    const engineersList = ['Rahul Sharma', 'Suresh Yadav', 'Amit Singh', 'Vikas Patel', 'Karan Mehta'];

    // Generate ~100 jobs for May 2025
    for (let day = 1; day <= 30; day++) {
      const numJobs = Math.floor(Math.random() * 4) + 1; // 1 to 4 jobs per day
      for (let j = 0; j < numJobs; j++) {
        const jobId = `JOB-${1000 + Math.floor(Math.random() * 200)}`;
        const service = servicesList[Math.floor(Math.random() * servicesList.length)];
        const location = locationsList[Math.floor(Math.random() * locationsList.length)];
        const priority = prioritiesList[Math.floor(Math.random() * prioritiesList.length)];
        const status = statusesList[Math.floor(Math.random() * statusesList.length)];
        const assignedTo = status !== 'pending' ? engineersList[Math.floor(Math.random() * engineersList.length)] : null;
        const charge = Math.floor(1200 + Math.random() * 6000);
        
        // Date in May 2025
        const date = new Date(2025, 4, day, Math.floor(9 + Math.random() * 8), Math.floor(Math.random() * 60));

        extraMayJobs.push({
          jobId,
          service,
          location,
          priority,
          assignedTo,
          status,
          charge,
          date
        });
      }
    }

    // Seed dynamic jobs for current year/month (June/July 2026) to make sure "This Month" filter is populated
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed
    const dynamicJobs = [];

    for (let day = 1; day <= 28; day++) {
      const numJobs = Math.floor(Math.random() * 5) + 1; // 1 to 5 jobs per day
      for (let j = 0; j < numJobs; j++) {
        const jobId = `JOB-${2000 + day * 10 + j}`;
        const service = servicesList[Math.floor(Math.random() * servicesList.length)];
        const location = locationsList[Math.floor(Math.random() * locationsList.length)];
        const priority = prioritiesList[Math.floor(Math.random() * prioritiesList.length)];
        const status = statusesList[Math.floor(Math.random() * statusesList.length)];
        const assignedTo = status !== 'pending' ? engineersList[Math.floor(Math.random() * engineersList.length)] : null;
        const charge = Math.floor(1200 + Math.random() * 6000);
        
        const date = new Date(currentYear, currentMonth, day, Math.floor(9 + Math.random() * 8), Math.floor(Math.random() * 60));

        dynamicJobs.push({
          jobId,
          service,
          location,
          priority,
          assignedTo,
          status,
          charge,
          date
        });
      }
    }

    const allJobs = [
      ...screenshotJobs,
      ...extraMayJobs,
      ...dynamicJobs
    ].map(j => ({ ...j, companyId: company._id }));

    await B2BJob.insertMany(allJobs);
    console.log(`Seeded ${allJobs.length} jobs inside b2b_jobs collection.`);

    // 6. Seed Ledger transactions
    const ledgerTxns = [
      { companyId: company._id, transactionId: 'TXN-001', type: 'credit', amount: 200000, description: 'Bank Top Up', date: new Date('2025-05-01T10:00:00') },
      { companyId: company._id, transactionId: 'TXN-002', type: 'debit', amount: 2200, description: 'Charges for JOB-1249', date: new Date('2025-05-31T17:00:00') },
      { companyId: company._id, transactionId: 'TXN-003', type: 'debit', amount: 2800, description: 'Charges for JOB-1246', date: new Date('2025-05-29T15:00:00') }
    ];
    await B2BWalletTransaction.insertMany(ledgerTxns);
    console.log('Seeded ledger audit records.');

    // 7. Seed invoices
    const invoices = [
      { companyId: company._id, invoiceId: 'INV-2025-001', billingPeriod: '01 May 2025 - 31 May 2025', amount: 245680, status: 'Settled', date: new Date('2025-06-01T00:00:00') }
    ];
    await B2BInvoice.insertMany(invoices);
    console.log('Seeded corporate billing invoices.');

    console.log('Seeding process completed successfully!');
  } catch (error) {
    console.error('Seeding failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
