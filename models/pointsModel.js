const mongoose = require('mongoose');

const PointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  newBalance: {
    type: Number,
    required: true,
  },
  previousBalance: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Points', PointsSchema);