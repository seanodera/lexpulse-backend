const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventHostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  ticketInfo: [
    {
      ticketType: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      ticketsAvailable: {
        type: Number,
        required: true,
      },
      ticketsLeft: {
        type: Number,
        required: true,
      },
    }
  ],
  eventDate: {
    type: Date,
    required: true,
  },
  image: {
    type: [
      String
    ]
  },
  description: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);