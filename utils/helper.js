const Event = require('../models/eventModel');
const res = require("express/lib/response");
const axios = require("axios");
const {response} = require("express");

exports.calculateWeightedRating = async (eventId) => {
    const event = await Event.findById(eventId);
    if (event) {
        const {viewCount, ticketSales} = event;
        const weightedRating = (0.4 * viewCount) + (0.6 * ticketSales);
        event.weightedRating = weightedRating;
        await event.save();
        return weightedRating;
    }
};


exports.convertCurrency = async (amount, currency) => {
    try {
        if (currency && currency !== 'GHS') {
            const ratesUrl = `https://open.er-api.com/v6/latest/${currency}`;
            const response = await axios.get(ratesUrl);
            const data = response.data;
            const exchangeRates = data.rates;
            if (!exchangeRates || !exchangeRates['GHS']) {
                throw new Error('Exchange rate for GHS not found');
            }
            return amount * exchangeRates['GHS'] * 1.035;
        } else {
            return amount;
        }
    } catch (e) {

        throw new Error('Error getting exchange rates');
    }
};
