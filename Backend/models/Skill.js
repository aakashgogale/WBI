const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['worker', 'engineer', 'both'],
    default: 'worker',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a skill name'],
    trim: true,
    unique: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
