const mongoose = require('mongoose');


const RecurringEventSchema = new mongoose.Schema({
    id: String,
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'
    },
    startDate: Date,
    endDate: Date,
    name: String,
    description: String,
    dayOfWeek: Number,
    tables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VenueTable'
    }],
    startTime: String,
    endTime: String
});

const RecurringEvent = mongoose.model('RecurringEvent', RecurringEventSchema);

module.exports = RecurringEvent;
