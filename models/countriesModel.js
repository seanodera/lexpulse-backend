const mongoose = require('mongoose');

const CountriesSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Countries', CountriesSchema);