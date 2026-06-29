const XLSX = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const B2BBatch = require('../models/B2BBatch');
const B2BBatchErrors = require('../models/B2BBatchErrors');
const B2BJob = require('../models/B2BJob');
const B2BCompany = require('../models/B2BCompany');
const B2BWallet = require('../models/B2BWallet');
const B2BWalletTransaction = require('../models/B2BWalletTransaction');
const JobHistory = require('../models/JobHistory');
const UploadReport = require('../models/UploadReport');
const OneTimeService = require('../models/OneTimeService');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');
const B2BDeductionRule = require('../models/B2BDeductionRule');

const { geocodeAddress } = require('./locationService');

// Socket emission helper
const emitSocket = (app, room, event, data) => {
  try {
    const { getIO } = require('../sockets');
    const io = getIO();
    if (io) {
      io.to(room).emit(event, data);
      console.log(`[Socket] Emitted '${event}' to room '${room}'`);
    }
  } catch (err) {
    console.error(`[Socket Error] Could not emit event '${event}':`, err.message);
  }
};

/**
 * Smart column header mapping
 * Maps various Excel header titles to standardized internal fields.
 */
const mapHeaders = (rowObject) => {
  const mapping = {
    customerName: ['customer name', 'customer', 'client name', 'client', 'name'],
    phone: ['phone', 'phone number', 'mobile', 'mobile number', 'contact', 'contact number'],
    email: ['email', 'email address', 'mail'],
    address: ['address', 'street', 'location', 'address line 1', 'address line'],
    city: ['city', 'town'],
    state: ['state', 'region'],
    pincode: ['pincode', 'pin code', 'zipcode', 'zip code', 'zip'],
    latitude: ['latitude', 'lat'],
    longitude: ['longitude', 'lng', 'lon'],
    service: ['service', 'service name', 'category', 'service category'],
    subService: ['sub service', 'subservice', 'sub-service', 'service package'],
    priority: ['priority', 'urgency'],
    preferredDate: ['preferred date', 'schedule date', 'date'],
    preferredTime: ['preferred time', 'schedule time', 'time', 'time slot']
  };

  const normalizedRow = {};
  const rowKeys = Object.keys(rowObject);

  for (const [targetField, aliases] of Object.entries(mapping)) {
    // Find matching key in the rowObject
    const matchedKey = rowKeys.find(key => {
      const cleanKey = key.toLowerCase().trim().replace(/[-_]/g, ' ');
      return aliases.includes(cleanKey);
    });

    if (matchedKey !== undefined) {
      normalizedRow[targetField] = rowObject[matchedKey];
    } else {
      normalizedRow[targetField] = null;
    }
  }

  return normalizedRow;
};

/**
 * Geocoding Sequence Chain
 */
const geocodeRow = async (row) => {
  let coords = null;
  const address = row.address ? String(row.address).trim() : '';
  const city = row.city ? String(row.city).trim() : '';
  const pincode = row.pincode ? String(row.pincode).trim() : '';

  // 1. Try geocoding full address
  if (address) {
    coords = await geocodeAddress(address);
  }
  
  // 2. Try geocoding address + city
  if (!coords && address && city) {
    coords = await geocodeAddress(`${address}, ${city}`);
  }

  // 3. Try geocoding city + pincode
  if (!coords && city && pincode) {
    coords = await geocodeAddress(`${city} ${pincode}`);
  }

  // 4. Try geocoding pincode only
  if (!coords && pincode) {
    coords = await geocodeAddress(pincode);
  }

  // 5. Logical City-Center Coordinate Fallbacks (no external API hit)
  if (!coords && city) {
    const cityCoords = {
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'thane': { lat: 19.2183, lng: 72.9781 },
      'navi mumbai': { lat: 19.0330, lng: 73.0297 },
      'indore': { lat: 22.7196, lng: 75.8577 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
    };
    const cleanCity = city.toLowerCase().trim();
    if (cityCoords[cleanCity]) {
      coords = cityCoords[cleanCity];
    }
  }

  // 6. Absolute Fallback
  if (!coords) {
    coords = { lat: 19.0760, lng: 72.8777 }; // Mumbai default
  }

  return coords;
};

/**
 * Validate B2B Batch (BullMQ Task)
 */
const processValidation = async (batchId, app) => {
  const batch = await B2BBatch.findById(batchId);
  if (!batch) {
    console.error(`[Validation] Batch ${batchId} not found in database`);
    return;
  }

  console.log(`[Validation] Starting processing for Batch: ${batchId}`);
  batch.status = 'validating';
  await batch.save();

  emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:validationStarted', { batchId });
  emitSocket(app, `batch:${batchId}`, 'b2b:validationStarted', { batchId });

  try {
    // 1. Fetch spreadsheet file paths
    // The uploaded file is saved locally under uploads/ directory (Multer configuration)
    const filePath = path.resolve(batch.fileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Spreadsheet file not found at path: ${filePath}`);
    }

    // 2. Parse file using XLSX
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const totalRows = rawRows.length;
    batch.totalRows = totalRows;
    await batch.save();

    if (totalRows === 0) {
      throw new Error('The uploaded spreadsheet is empty');
    }

    // 3. Pre-fetch Active Services from DB to validate in-memory
    const activeOneTimeServices = await OneTimeService.find({ isActive: true }).select('name slug');
    const activeCategories = await ServiceCategory.find({ isActive: true }).select('name slug');
    const activeSubServices = await SubService.find({ isActive: true }).select('name slug');

    const serviceCache = new Set();
    activeOneTimeServices.forEach(s => {
      serviceCache.add(s.name.toLowerCase().trim());
      serviceCache.add(s.slug.toLowerCase().trim());
    });
    activeCategories.forEach(c => {
      serviceCache.add(c.name.toLowerCase().trim());
      serviceCache.add(c.slug.toLowerCase().trim());
    });
    activeSubServices.forEach(sub => {
      serviceCache.add(sub.name.toLowerCase().trim());
      serviceCache.add(sub.slug.toLowerCase().trim());
    });

    // 4. Set up batching variables
    let validRows = 0;
    let invalidRows = 0;
    let duplicates = 0;

    const parsedRows = [];
    const errorChunks = [];

    // Track duplicates inside this file (Phone + Address combination)
    const rowSignatures = new Set();

    // 5. Parse and Validate Chunks of rows
    for (let index = 0; index < totalRows; index++) {
      const rawRow = rawRows[index];
      const rowNum = index + 1;

      // Smart Mapping
      const mapped = mapHeaders(rawRow);
      const errors = [];

      // A. Validate Customer Name
      if (!mapped.customerName) {
        errors.push('Missing customer name');
      }

      // B. Validate Phone
      if (!mapped.phone) {
        errors.push('Missing phone number');
      } else {
        const cleanPhone = String(mapped.phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length !== 10) {
          errors.push('Wrong mobile number (must be 10 digits)');
        }
      }

      // C. Validate Email (Optional, but checks format if present)
      if (mapped.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(mapped.email).trim())) {
          errors.push('Wrong email format');
        }
      }

      // D. Validate Address
      if (!mapped.address) {
        errors.push('Missing address');
      }

      // E. Validate City & Pincode
      if (!mapped.city) {
        errors.push('Missing city');
      }
      if (!mapped.pincode) {
        errors.push('Missing pincode');
      }

      // F. Service Validation
      if (!mapped.service) {
        errors.push('Missing service type');
      } else {
        const cleanService = String(mapped.service).toLowerCase().trim();
        if (!serviceCache.has(cleanService)) {
          errors.push(`Unknown or inactive service type: "${mapped.service}"`);
        }
      }

      // G. Date Validation
      if (!mapped.preferredDate) {
        errors.push('Missing preferred date');
      } else {
        // Excel stores dates as serial numbers or standard strings
        let parsedDate;
        if (typeof mapped.preferredDate === 'number') {
          // Excel date serial number
          parsedDate = new Date((mapped.preferredDate - 25569) * 86400 * 1000);
        } else {
          parsedDate = new Date(mapped.preferredDate);
        }

        if (isNaN(parsedDate.getTime())) {
          errors.push('Invalid date format (use YYYY-MM-DD)');
        } else {
          mapped.preferredDate = parsedDate;
        }
      }

      // H. Duplicate Checks (Inside File)
      const cleanPhone = mapped.phone ? String(mapped.phone).replace(/[^0-9]/g, '') : '';
      const cleanAddr = mapped.address ? String(mapped.address).toLowerCase().trim() : '';
      const signature = `${cleanPhone}_${cleanAddr}`;

      if (cleanPhone && cleanAddr) {
        if (rowSignatures.has(signature)) {
          duplicates++;
          errors.push('Duplicate row found within this file');
        } else {
          rowSignatures.add(signature);
        }

        // I. Duplicate check against existing active jobs (Database)
        const dbDuplicate = await B2BJob.findOne({
          phone: cleanPhone,
          address: { $regex: new RegExp(cleanAddr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') },
          status: { $in: ['pending', 'searching_engineer', 'assigned', 'in_progress'] }
        });
        if (dbDuplicate) {
          duplicates++;
          errors.push('Similar job already exists in active matching state');
        }
      }

      // J. Geocoding coordinates resolution (Geocode chain)
      let finalLat = parseFloat(mapped.latitude);
      let finalLng = parseFloat(mapped.longitude);

      if (isNaN(finalLat) || isNaN(finalLng) || finalLat === 0 || finalLng === 0) {
        // Resolve from geocoding service
        const coords = await geocodeRow(mapped);
        finalLat = coords.lat;
        finalLng = coords.lng;
      }

      mapped.latitude = finalLat;
      mapped.longitude = finalLng;

      // K. Collect details
      if (errors.length > 0) {
        invalidRows++;
        errorChunks.push({
          batchId: batch._id,
          rowNumber: rowNum,
          rowData: mapped,
          errors: errors
        });
      } else {
        validRows++;
      }

      parsedRows.push(mapped);

      // 6. Emit real-time progress update every 100 rows
      if (rowNum % 100 === 0 || rowNum === totalRows) {
        batch.processedRows = rowNum;
        batch.validRows = validRows;
        batch.invalidRows = invalidRows;
        batch.duplicates = duplicates;
        await batch.save();

        const progressPercent = Math.round((rowNum / totalRows) * 100);
        emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:validationProgress', {
          batchId,
          progress: progressPercent,
          total: totalRows,
          processed: rowNum,
          valid: validRows,
          invalid: invalidRows,
          duplicates
        });
        emitSocket(app, `batch:${batchId}`, 'b2b:validationProgress', {
          batchId,
          progress: progressPercent,
          total: totalRows,
          processed: rowNum,
          valid: validRows,
          invalid: invalidRows,
          duplicates
        });
      }
    }

    // 7. Insert errors into DB in one bulk operation (Relational)
    if (errorChunks.length > 0) {
      await B2BBatchErrors.deleteMany({ batchId: batch._id }); // Clear previous
      await B2BBatchErrors.insertMany(errorChunks);
    }

    // 8. Fetch active deduction rules to calculate costs
    let rule = await B2BDeductionRule.findOne({ companyId: batch.companyId, isActive: true });
    if (!rule) {
      rule = await B2BDeductionRule.create({ companyId: batch.companyId, perJobCharge: 12, gstPercent: 18, isActive: true });
    }
    const perJobCharge = rule.perJobCharge;
    const gstPercent = rule.gstPercent;
    const ratePerJob = parseFloat((perJobCharge * (1 + gstPercent / 100)).toFixed(2));
    const estimatedCost = parseFloat((validRows * ratePerJob).toFixed(2));

    // 9. Update final batch data
    batch.validRows = validRows;
    batch.invalidRows = invalidRows;
    batch.duplicates = duplicates;
    batch.estimatedCost = estimatedCost;
    batch.perJobCharge = ratePerJob;
    batch.status = 'validated';
    await batch.save();

    // 10. Write validation reports reference
    await UploadReport.create({
      batchId: batch._id,
      reportType: 'error_report',
      fileName: `validation_errors_${batch.batchId}.xlsx`,
      fileUrl: `/api/b2b/bulk-jobs/errors/${batch._id}/download`
    });

    console.log(`[Validation] Completed Batch: ${batchId}. Valid: ${validRows}, Invalid: ${invalidRows}`);
    emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:validationCompleted', {
      batchId,
      total: totalRows,
      valid: validRows,
      invalid: invalidRows,
      duplicates,
      estimatedCost
    });
    emitSocket(app, `batch:${batchId}`, 'b2b:validationCompleted', {
      batchId,
      total: totalRows,
      valid: validRows,
      invalid: invalidRows,
      duplicates,
      estimatedCost
    });

  } catch (error) {
    console.error(`[Validation Error] Batch ${batchId} failed validation:`, error);
    batch.status = 'failed';
    batch.failedAt = new Date();
    batch.failureReason = error.message;
    await batch.save();

    emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:validationFailed', {
      batchId,
      error: error.message
    });
    emitSocket(app, `batch:${batchId}`, 'b2b:validationFailed', {
      batchId,
      error: error.message
    });
  }
};

/**
 * Perform Job Creation (BullMQ Task)
 * Process rows, save in Mongo using BulkWrite, deduct Wallet
 */
const processJobCreation = async (batchId, app) => {
  const batch = await B2BBatch.findById(batchId);
  if (!batch) {
    console.error(`[Job Creation] Batch ${batchId} not found`);
    return;
  }

  console.log(`[Job Creation] Starting insertion for Batch: ${batchId}`);
  batch.status = 'processing';
  await batch.save();

  emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:uploadStarted', { batchId });
  emitSocket(app, `batch:${batchId}`, 'b2b:uploadStarted', { batchId });

  try {
    // 1. Double check wallet balance
    const wallet = await B2BWallet.findOne({ companyId: batch.companyId });
    if (!wallet || wallet.balance < batch.estimatedCost) {
      throw new Error(`Insufficient wallet balance. Required: ₹${batch.estimatedCost}, Balance: ₹${wallet ? wallet.balance : 0}`);
    }

    const company = await B2BCompany.findById(batch.companyId);
    if (!company || company.verificationStatus !== 'approved' || !company.isActive) {
      throw new Error('Your company account is currently inactive or not approved by WBI Admins');
    }

    // 2. Parse file to retrieve valid rows
    // Since we validated earlier, we know which rows are valid by checking rows that have NO errors.
    const filePath = path.resolve(batch.fileUrl);
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const errorsList = await B2BBatchErrors.find({ batchId: batch._id }).select('rowNumber');
    const invalidRowIndices = new Set(errorsList.map(err => err.rowNumber - 1)); // 0-indexed

    const validParsedRows = [];
    for (let index = 0; index < rawRows.length; index++) {
      if (invalidRowIndices.has(index)) continue; // Skip invalid rows

      const rawRow = rawRows[index];
      const mapped = mapHeaders(rawRow);

      // Re-read preferredDate & coordinates derived during validation stage
      let parsedDate;
      if (typeof mapped.preferredDate === 'number') {
        parsedDate = new Date((mapped.preferredDate - 25569) * 86400 * 1000);
      } else {
        parsedDate = new Date(mapped.preferredDate);
      }
      mapped.preferredDate = parsedDate;

      // Fallback coordinate lookup
      const coords = await geocodeRow(mapped);
      mapped.latitude = coords.lat;
      mapped.longitude = coords.lng;

      validParsedRows.push(mapped);
    }

    if (validParsedRows.length === 0) {
      throw new Error('No valid jobs found in this batch to create');
    }

    // 3. Deduct Wallet Balance (Atomic transaction updates)
    wallet.balance = parseFloat((wallet.balance - batch.estimatedCost).toFixed(2));
    wallet.totalSpent = parseFloat((wallet.totalSpent + batch.estimatedCost).toFixed(2));
    wallet.lastUpdatedAt = new Date();
    await wallet.save();

    // Sync B2B Company walletBalance
    company.walletBalance = wallet.balance;
    await company.save();

    // Log Wallet Debit transaction
    const transactionId = `TXN-BULK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newTxn = await B2BWalletTransaction.create({
      companyId: batch.companyId,
      walletId: wallet._id,
      transactionId,
      type: 'job_deduction',
      amount: -batch.estimatedCost,
      totalAmount: -batch.estimatedCost,
      status: 'success',
      paymentMethod: 'wallet',
      remark: `Auto-deduction for bulk jobs creation (Batch ID: ${batch.batchId}, Rows: ${validParsedRows.length})`
    });

    // 4. Generate Job objects and build bulkWrite writes
    const jobWrites = [];
    const historyLogs = [];
    const jobIdsList = [];

    const datePrefix = Date.now().toString().substring(5);

    for (let index = 0; index < validParsedRows.length; index++) {
      const row = validParsedRows[index];
      const uniqueJobId = `JOB-B2B-${datePrefix}-${Math.floor(1000 + Math.random() * 9000)}-${index}`;
      const jobMongoId = new mongoose.Types.ObjectId();

      jobIdsList.push(jobMongoId);

      const jobDoc = {
        _id: jobMongoId,
        companyId: batch.companyId,
        batchId: batch._id,
        jobId: uniqueJobId,
        customerName: row.customerName,
        phone: String(row.phone).replace(/[^0-9]/g, ''),
        email: row.email || '',
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        coordinates: {
          type: 'Point',
          coordinates: [row.longitude, row.latitude] // longitude first in GeoJSON
        },
        service: row.service,
        subService: row.subService || '',
        priority: row.priority || 'Medium',
        preferredDate: row.preferredDate,
        preferredTime: row.preferredTime || 'Anytime',
        status: 'searching_engineer', // Automatically sends to matching queue
        charge: batch.perJobCharge,
        paymentStatus: 'deducted',
        date: new Date()
      };

      // Add to bulk writes
      jobWrites.push({
        insertOne: {
          document: jobDoc
        }
      });

      // Prepare Job History
      historyLogs.push({
        jobId: jobMongoId,
        status: 'searching_engineer',
        remark: `Job initialized via Bulk Upload (Batch ID: ${batch.batchId})`,
        role: 'system'
      });
    }

    // 5. Execute MongoDB bulk writes in chunks for high performance
    const chunkSize = 500;
    let written = 0;

    for (let i = 0; i < jobWrites.length; i += chunkSize) {
      const chunk = jobWrites.slice(i, i + chunkSize);
      await B2BJob.bulkWrite(chunk);
      written += chunk.length;

      // Save chunk history
      const historyChunk = historyLogs.slice(i, i + chunkSize);
      await JobHistory.insertMany(historyChunk);

      // Emit socket progress
      const percent = Math.round((written / validParsedRows.length) * 100);
      emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:creationProgress', {
        batchId,
        progress: percent,
        written,
        total: validParsedRows.length
      });
      emitSocket(app, `batch:${batchId}`, 'b2b:creationProgress', {
        batchId,
        progress: percent,
        written,
        total: validParsedRows.length
      });
    }

    // 6. Complete Batch
    batch.status = 'completed';
    batch.completedAt = new Date();
    await batch.save();

    // Update transactions with the real job MongoDB references
    newTxn.relatedJobIds = jobIdsList;
    await newTxn.save();

    // 7. Trigger the Engineer Allocation matching queue for each job
    const b2bMatchingService = require('./b2bMatchingService');
    for (const jobMongoId of jobIdsList) {
      // Trigger matching async in background
      b2bMatchingService.queueJobMatching(jobMongoId, app).catch(err => {
        console.error(`[Matching Trigger Error] Job ID ${jobMongoId} allocation failed:`, err);
      });
    }

    // 8. Emit final completions
    emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:uploadCompleted', {
      batchId,
      createdCount: validParsedRows.length,
      walletBalance: wallet.balance
    });
    emitSocket(app, `batch:${batchId}`, 'b2b:uploadCompleted', {
      batchId,
      createdCount: validParsedRows.length,
      walletBalance: wallet.balance
    });
    emitSocket(app, 'admin', 'admin:batchCompleted', {
      batchId,
      companyName: company.companyName,
      createdCount: validParsedRows.length
    });

  } catch (error) {
    console.error(`[Job Creation Error] Batch ${batchId} failed job creation:`, error);
    batch.status = 'failed';
    batch.failedAt = new Date();
    batch.failureReason = error.message;
    await batch.save();

    emitSocket(app, `b2b:${batch.companyId.toString()}`, 'b2b:uploadFailed', {
      batchId,
      error: error.message
    });
    emitSocket(app, `batch:${batchId}`, 'b2b:uploadFailed', {
      batchId,
      error: error.message
    });
  }
};

module.exports = {
  processValidation,
  processJobCreation,
  generateSampleExcelBuffer: () => {
    const headers = [
      'Customer Name', 'Phone', 'Email', 'Address', 'City', 'State', 'Pincode',
      'Latitude', 'Longitude', 'Service', 'Sub Service', 'Priority', 'Preferred Date', 'Preferred Time'
    ];
    
    const sampleData = [
      {
        'Customer Name': 'Ramesh Mehta',
        'Phone': '9876543210',
        'Email': 'ramesh@example.com',
        'Address': '2, MG Road',
        'City': 'Mumbai',
        'State': 'Maharashtra',
        'Pincode': '400001',
        'Latitude': 18.9268,
        'Longitude': 72.8273,
        'Service': 'AC Repair',
        'Sub Service': 'AC Cleaning',
        'Priority': 'High',
        'Preferred Date': '2026-07-01',
        'Preferred Time': '10:00 AM - 01:00 PM'
      },
      {
        'Customer Name': 'Suresh Yadav',
        'Phone': '9876543211',
        'Email': 'suresh@example.com',
        'Address': '15, Kalyani Nagar',
        'City': 'Pune',
        'State': 'Maharashtra',
        'Pincode': '411006',
        'Latitude': 18.5463,
        'Longitude': 73.9033,
        'Service': 'Plumbing',
        'Sub Service': 'Leakage Repair',
        'Priority': 'Medium',
        'Preferred Date': '2026-07-02',
        'Preferred Time': '02:00 PM - 05:00 PM'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    
    // Auto-fit columns
    const wscols = headers.map(h => ({ wch: Math.max(h.length + 3, 15) }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Jobs Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
};
