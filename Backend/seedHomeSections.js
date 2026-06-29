const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const HomeSection = require('./models/HomeSection');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const sectionsData = [
  {
    sectionKey: 'care_plan',
    title: 'Peace of mind',
    highlightedText: 'with WBI Care Plan',
    subtitle: 'Get annual maintenance & priority support at exclusive prices.',
    badgeText: 'WBI Care Plan',
    buttonText: 'Explore Care Plans',
    buttonRedirect: '/user/rewards',
    discountText: 'UP TO 20% SAVINGS*',
    imageUrl: '/rider-3D.png', // Fallback to local 3D illustration asset in public folder
    mobileImageUrl: '/rider-3D.png',
    items: [
      { title: 'Priority Booking', sortOrder: 0, isActive: true },
      { title: 'Free Check-ups', sortOrder: 1, isActive: true },
      { title: 'Exclusive Discounts', sortOrder: 2, isActive: true },
      { title: '24x7 Support', sortOrder: 3, isActive: true }
    ],
    isActive: true,
    sortOrder: 0
  },
  {
    sectionKey: 'why_choose',
    title: 'Why Choose WBI?',
    items: [
      {
        title: 'Verified Experts',
        description: 'Background verified & trained professionals',
        iconName: 'FiShield',
        sortOrder: 0,
        isActive: true
      },
      {
        title: 'Transparent Pricing',
        description: 'No hidden charges. What you see is what you pay.',
        iconName: 'FiDollarSign',
        sortOrder: 1,
        isActive: true
      },
      {
        title: 'On-time Service',
        description: 'We value your time and always deliver on schedule.',
        iconName: 'FiClock',
        sortOrder: 2,
        isActive: true
      },
      {
        title: '100% Satisfaction',
        description: 'Quality service or your money back.',
        iconName: 'FiCheckCircle',
        sortOrder: 3,
        isActive: true
      },
      {
        title: '24x7 Support',
        description: "We're here for you anytime, anywhere.",
        iconName: 'FiPhoneCall',
        sortOrder: 4,
        isActive: true
      }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    sectionKey: 'how_it_works',
    title: 'How It Works',
    items: [
      {
        title: 'Choose Service',
        description: 'Select the service you need',
        stepNumber: 1,
        iconName: 'FiSearch',
        sortOrder: 0,
        isActive: true
      },
      {
        title: 'Book & Schedule',
        description: 'Pick a convenient date & time',
        stepNumber: 2,
        iconName: 'FiCalendar',
        sortOrder: 1,
        isActive: true
      },
      {
        title: 'Expert Arrives',
        description: 'Our expert reaches your location',
        stepNumber: 3,
        iconName: 'FiUser',
        sortOrder: 2,
        isActive: true
      },
      {
        title: 'Service Done',
        description: 'Work completed with quality check',
        stepNumber: 4,
        iconName: 'FiCheckSquare',
        sortOrder: 3,
        isActive: true
      },
      {
        title: 'Pay & Relax',
        description: 'Safe payment & peace of mind',
        stepNumber: 5,
        iconName: 'FiSmile',
        sortOrder: 4,
        isActive: true
      }
    ],
    isActive: true,
    sortOrder: 2
  }
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully.');

    for (const data of sectionsData) {
      console.log(`Seeding section: ${data.sectionKey}...`);
      await HomeSection.findOneAndUpdate(
        { sectionKey: data.sectionKey },
        { $set: data },
        { upsert: true, new: true }
      );
    }

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
