require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const B2BCompany = require('../models/B2BCompany');
const B2BWallet = require('../models/B2BWallet');
const B2BBatch = require('../models/B2BBatch');
const B2BBatchErrors = require('../models/B2BBatchErrors');
const B2BJob = require('../models/B2BJob');
const B2BWalletTransaction = require('../models/B2BWalletTransaction');
const JobHistory = require('../models/JobHistory');

const b2bBulkJobService = require('../services/b2bBulkJobService');

// Mock Express app context for socket notifications
const mockApp = {
  get: (name) => {
    return {
      to: (room) => ({
        emit: (event, data) => {
          console.log(`[SOCKET MOCK EMIT] -> Room: ${room}, Event: ${event}, Data:`, JSON.stringify(data));
        }
      })
    };
  }
};

async function runTest() {
  console.log('--- Starting B2B Bulk Upload Validation Test ---');
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Resolve Company Context
    let company = await B2BCompany.findOne({ email: 'techsolve@wbi.in' });
    if (!company) {
      console.log('Company techsolve@wbi.in not found. Creating a test approved company...');
      company = await B2BCompany.create({
        companyName: 'TechSolve Pvt Ltd Test',
        gstNumber: '27TECHSOLV1234Z',
        panNumber: 'TECHSOL123',
        tanNumber: 'TAN1234567',
        companyAddress: '404, Tech Tower, Powai, Mumbai',
        billingAddress: '404, Tech Tower, Powai, Mumbai',
        authorizedPerson: {
          name: 'Partner Admin',
          designation: 'Admin',
          email: 'techsolve@wbi.in',
          phone: '9876543210'
        },
        email: 'techsolve@wbi.in',
        phone: '9876543210',
        passwordHash: '$2a$10$xyz', // Mock hash
        verificationStatus: 'approved',
        isActive: true,
        walletBalance: 100000
      });
    }

    // 2. Ensure Wallet balance
    let wallet = await B2BWallet.findOne({ companyId: company._id });
    if (!wallet) {
      wallet = await B2BWallet.create({
        companyId: company._id,
        balance: 100000
      });
    } else {
      wallet.balance = 100000;
      await wallet.save();
    }
    company.walletBalance = 100000;
    await company.save();
    console.log(`✅ Wallet Balance set to: ₹${wallet.balance}`);

    // 3. Create a mock Excel sheet locally to simulate file upload
    const uploadFolder = path.join(__dirname, '../uploads/b2b-bulk');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const testFilePath = path.join(uploadFolder, 'test_bulk_jobs_upload.xlsx');
    
    // Rows to write: 50 valid and 3 invalid
    const rows = [];
    
    // Add 50 Valid rows
    for (let i = 1; i <= 50; i++) {
      rows.push({
        'Customer Name': `Customer Valid ${i}`,
        'Phone': `9876543210`, // Phone
        'Email': `customer${i}@wbitest.in`,
        'Address': `${i}, MG Road, Vashi`,
        'City': 'Navi Mumbai',
        'State': 'Maharashtra',
        'Pincode': '400703',
        'Latitude': 19.0330,
        'Longitude': 73.0297,
        'Service': 'AC Repair',
        'Sub Service': 'AC servicing',
        'Priority': i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
        'Preferred Date': '2026-07-05',
        'Preferred Time': '09:00 AM - 12:00 PM'
      });
    }

    // Add 3 Invalid rows
    rows.push({
      'Customer Name': '', // Invalid: Missing Name
      'Phone': '123', // Invalid: Wrong Phone digits
      'Email': 'invalid_email', // Invalid: Wrong email format
      'Address': 'Some Address',
      'City': 'Mumbai',
      'State': 'MH',
      'Pincode': '400001',
      'Service': 'Unknown Category', // Invalid: Unknown service
      'Preferred Date': 'bad_date' // Invalid: Wrong date format
    });

    rows.push({
      'Customer Name': 'Missing Service Customer',
      'Phone': '9876543220',
      'Address': 'Some Address',
      'City': 'Mumbai',
      'State': 'MH',
      'Pincode': '400001',
      'Service': '', // Invalid: Missing service
      'Preferred Date': '2026-07-05'
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Upload');
    XLSX.writeFile(wb, testFilePath);
    console.log(`✅ Test spreadsheet file generated at: ${testFilePath}`);

    // 4. Create Batch record
    const batchId = `TEST-BATCH-${Date.now()}`;
    const batch = await B2BBatch.create({
      companyId: company._id,
      batchId,
      fileName: 'test_bulk_jobs_upload.xlsx',
      fileUrl: testFilePath,
      status: 'draft',
      totalRows: 0,
      walletBalanceAtUpload: wallet.balance,
      perJobCharge: 12
    });
    console.log(`✅ Created test batch record. ID: ${batch._id}, batchId: ${batch.batchId}`);

    // 5. Run Validation
    console.log('--- Triggering validation function ---');
    await b2bBulkJobService.processValidation(batch._id, mockApp);

    // 6. Verify validation output
    const validatedBatch = await B2BBatch.findById(batch._id);
    console.log('\n--- Validation Results Verification ---');
    console.log(`Status: ${validatedBatch.status}`);
    console.log(`Total Rows: ${validatedBatch.totalRows}`);
    console.log(`Valid Rows: ${validatedBatch.validRows} (Expected: 50)`);
    console.log(`Invalid Rows: ${validatedBatch.invalidRows} (Expected: 2)`);
    console.log(`Duplicates: ${validatedBatch.duplicates}`);
    console.log(`Estimated Cost: ₹${validatedBatch.estimatedCost}`);

    const errorLogs = await B2BBatchErrors.find({ batchId: batch._id });
    console.log(`Stored Error Entries in Database: ${errorLogs.length}`);
    errorLogs.forEach(err => {
      console.log(` - Row ${err.rowNumber}: Errors: ${err.errors.join(', ')}`);
    });

    if (validatedBatch.validRows !== 50 || validatedBatch.invalidRows !== 2) {
      throw new Error('❌ Test verification failed: row counts do not match expected validations');
    }
    console.log('✅ Validation verified successfully.');

    // 7. Run Job Creation
    console.log('\n--- Triggering Job Creation function ---');
    await b2bBulkJobService.processJobCreation(batch._id, mockApp);

    // 8. Verify database state after creation
    const processedBatch = await B2BBatch.findById(batch._id);
    console.log('\n--- Post-Dispatch Database Verification ---');
    console.log(`Final Status: ${processedBatch.status}`);
    
    const finalWallet = await B2BWallet.findOne({ companyId: company._id });
    console.log(`Wallet Balance Left: ₹${finalWallet.balance} (Previous: ₹100,000, Cost: ₹${processedBatch.estimatedCost})`);
    
    const expectedCost = parseFloat((processedBatch.estimatedCost).toFixed(2));
    const expectedWalletBalance = parseFloat((100000 - expectedCost).toFixed(2));
    if (finalWallet.balance !== expectedWalletBalance) {
      throw new Error(`❌ Wallet balance decrement mismatch: got ${finalWallet.balance}, expected ${expectedWalletBalance}`);
    }
    console.log('✅ Wallet deduction balance verified.');

    const createdJobsCount = await B2BJob.countDocuments({ batchId: batch._id });
    console.log(`Created B2BJob records: ${createdJobsCount} (Expected: 50)`);
    if (createdJobsCount !== 50) {
      throw new Error(`❌ Jobs count mismatch: got ${createdJobsCount}, expected 50`);
    }
    console.log('✅ Dispatched job records verified.');

    // Check one job detail
    const sampleJob = await B2BJob.findOne({ batchId: batch._id });
    console.log(`Sample Job details:`);
    console.log(` - ID: ${sampleJob.jobId}`);
    console.log(` - Customer: ${sampleJob.customerName}`);
    console.log(` - Service: ${sampleJob.service}`);
    console.log(` - Status: ${sampleJob.status}`);
    console.log(` - Coordinates: ${JSON.stringify(sampleJob.coordinates)}`);
    console.log(` - Payment status: ${sampleJob.paymentStatus}`);

    const sampleJobLogs = await JobHistory.countDocuments({ jobId: sampleJob._id });
    console.log(`Sample Job logs entries count: ${sampleJobLogs}`);

    console.log('\n✅ ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! CLEANUP RUNNING...');
    
    // Cleanup test data
    await B2BBatch.findByIdAndDelete(batch._id);
    await B2BBatchErrors.deleteMany({ batchId: batch._id });
    await B2BJob.deleteMany({ batchId: batch._id });
    await B2BWalletTransaction.deleteMany({ companyId: company._id });
    await JobHistory.deleteMany({ jobId: { $in: await B2BJob.find({ batchId: batch._id }).select('_id') } });
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    console.log('✅ Cleanup finished.');

  } catch (error) {
    console.error('❌ Run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

runTest();
