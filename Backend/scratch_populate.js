require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const WorkerProject = require('./models/WorkerProject');
const Worker = require('./models/Worker');

async function populate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const worker = await Worker.findOne();
    if (!worker) {
      console.log('No worker found');
      return;
    }
    console.log('Using worker:', worker._id);

    // Create a mock project with advanced milestones
    const project1 = new WorkerProject({
      projectName: 'Website Development',
      projectType: 'Website Development',
      description: 'Develop a business website with modern UI, admin panel, blog, and contact form.',
      scopeOfWork: ['Admin Panel', 'Blog Module', 'Contact Form', 'API Integration'],
      requirementsSummary: ['Responsive Design', 'SEO Optimized'],
      workerId: worker._id,
      status: 'In Progress',
      startDate: new Date('2024-04-10'),
      dueDate: new Date('2024-05-25'),
      totalAmount: 25000,
      paidAmount: 10000,
      milestones: [
        { 
          title: 'Requirement Gathering', 
          status: 'Completed',
          completedAt: new Date('2024-04-10'),
          description: 'Gathered all requirements from the client regarding the target audience and design preferences.',
          deliverables: ['Requirement Document PDF', 'Project Proposal']
        },
        { 
          title: 'UI/UX Design', 
          status: 'In Progress',
          assignedDate: new Date('2024-04-11'),
          description: 'Creating high-fidelity Figma mockups for all core screens.',
          deliverables: ['Figma Links', 'Wireframes'],
          dueDate: new Date('2024-04-20')
        },
        { 
          title: 'Frontend Development', 
          status: 'Pending',
          description: 'Translating designs into responsive React components.',
          dueDate: new Date('2024-05-05')
        },
        { 
          title: 'Backend Development', 
          status: 'Pending',
          description: 'Setting up Node.js APIs and MongoDB collections.',
          dueDate: new Date('2024-05-15')
        },
        { 
          title: 'Testing & Deployment', 
          status: 'Pending',
          description: 'Final QA testing and Vercel/AWS deployment.',
          dueDate: new Date('2024-05-25')
        }
      ]
    });

    await project1.save();
    console.log('Test project with detailed milestones inserted!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populate();
