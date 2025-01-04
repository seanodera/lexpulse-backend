const mongoose = require('mongoose');

const VenueTableSchema = new mongoose.Schema({
    name: String,
    venueId: String,
    description: String,
    minimumSpend: Number,
    available: Number
});

const VenueTable = mongoose.model('VenueTable', VenueTableSchema);

module.exports = VenueTable;
