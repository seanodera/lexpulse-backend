const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentMethod: {
    type: String
  },
  numberOfTickets: {
    type: Number
  },
  totalPrice: {
    type: Number
  },
  amountPaid: {
    type: Number
  },
  status: {
    type: String
  },
  image: {
    type: [
      String
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);