const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activateCode: {
    type: Number,
    required: true,
  },
  numberOfTries: {
    type: Number,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Otp', OtpSchema);