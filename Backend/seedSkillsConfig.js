const mongoose = require('mongoose');
const FormConfig = require('./models/FormConfig');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wbi');
    console.log('Connected to DB');

    await FormConfig.deleteMany({ formType: 'skills' });

    const fields = [
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'coreSkills',
        label: 'Core Skills',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'Frontend Development', value: 'Frontend Development' },
          { label: 'Backend Development', value: 'Backend Development' },
          { label: 'Full Stack Development', value: 'Full Stack Development' },
          { label: 'Mobile App Development', value: 'Mobile App Development' },
          { label: 'UI/UX Design', value: 'UI/UX Design' },
          { label: 'CRM Development', value: 'CRM Development' },
          { label: 'DevOps', value: 'DevOps' },
          { label: 'QA Testing', value: 'QA Testing' },
          { label: 'Digital Marketing', value: 'Digital Marketing' },
          { label: 'Project Management', value: 'Project Management' }
        ],
        order: 1
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'technologies',
        label: 'Technologies',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'React.js', value: 'React.js' },
          { label: 'Next.js', value: 'Next.js' },
          { label: 'Vue.js', value: 'Vue.js' },
          { label: 'Angular', value: 'Angular' },
          { label: 'Node.js', value: 'Node.js' },
          { label: 'Express.js', value: 'Express.js' },
          { label: 'NestJS', value: 'NestJS' },
          { label: 'Laravel', value: 'Laravel' },
          { label: 'Django', value: 'Django' },
          { label: 'Flutter', value: 'Flutter' },
          { label: 'React Native', value: 'React Native' },
          { label: 'Android', value: 'Android' },
          { label: 'iOS', value: 'iOS' },
          { label: 'MongoDB', value: 'MongoDB' },
          { label: 'MySQL', value: 'MySQL' },
          { label: 'PostgreSQL', value: 'PostgreSQL' },
          { label: 'Firebase', value: 'Firebase' },
          { label: 'AWS', value: 'AWS' },
          { label: 'Azure', value: 'Azure' },
          { label: 'Google Cloud', value: 'Google Cloud' }
        ],
        order: 2
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'experienceLevel',
        label: 'Experience Level',
        type: 'select',
        required: true,
        options: [
          { label: 'Fresher (0-1 Year)', value: 'Fresher (0-1 Year)' },
          { label: 'Junior (1-3 Years)', value: 'Junior (1-3 Years)' },
          { label: 'Mid-Level (3-5 Years)', value: 'Mid-Level (3-5 Years)' },
          { label: 'Senior (5-8 Years)', value: 'Senior (5-8 Years)' },
          { label: 'Expert (8+ Years)', value: 'Expert (8+ Years)' }
        ],
        order: 3
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'preferredProjectTypes',
        label: 'Preferred Project Types',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'Website Development', value: 'Website Development' },
          { label: 'Ecommerce Development', value: 'Ecommerce Development' },
          { label: 'Mobile App Development', value: 'Mobile App Development' },
          { label: 'CRM Development', value: 'CRM Development' },
          { label: 'ERP Development', value: 'ERP Development' },
          { label: 'Admin Panels', value: 'Admin Panels' },
          { label: 'SaaS Products', value: 'SaaS Products' },
          { label: 'API Development', value: 'API Development' },
          { label: 'UI/UX Design', value: 'UI/UX Design' },
          { label: 'Digital Marketing', value: 'Digital Marketing' }
        ],
        order: 4
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'availabilityStatus',
        label: 'Availability Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Available Immediately', value: 'Available Immediately' },
          { label: 'Available in 7 Days', value: 'Available in 7 Days' },
          { label: 'Available in 15 Days', value: 'Available in 15 Days' },
          { label: 'Part Time', value: 'Part Time' },
          { label: 'Full Time', value: 'Full Time' }
        ],
        order: 5
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'workingMode',
        label: 'Working Mode',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'Remote', value: 'Remote' },
          { label: 'Hybrid', value: 'Hybrid' },
          { label: 'On Site', value: 'On Site' }
        ],
        order: 6
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'portfolioLinks',
        label: 'Portfolio Links (GitHub, LinkedIn, Website, Behance)',
        type: 'textarea',
        required: false,
        order: 7
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'certifications',
        label: 'Certifications',
        type: 'multiselect',
        required: false,
        options: [
          { label: 'AWS', value: 'AWS' },
          { label: 'Google', value: 'Google' },
          { label: 'Microsoft', value: 'Microsoft' },
          { label: 'Meta', value: 'Meta' },
          { label: 'Other', value: 'Other' }
        ],
        order: 8
      },
      {
        role: 'engineer',
        formType: 'skills',
        fieldKey: 'languagesKnown',
        label: 'Languages Known',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'English', value: 'English' },
          { label: 'Hindi', value: 'Hindi' },
          { label: 'Marathi', value: 'Marathi' },
          { label: 'Gujarati', value: 'Gujarati' },
          { label: 'Tamil', value: 'Tamil' },
          { label: 'Telugu', value: 'Telugu' },
          { label: 'Others', value: 'Others' }
        ],
        order: 9
      }
    ];

    await FormConfig.insertMany(fields);
    console.log('Seeded Digital Solutions skills FormConfig successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
