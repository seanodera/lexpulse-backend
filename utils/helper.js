const Event = require('../models/eventModel');
const User = require('../models/userModel');
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

exports.updateBalance = async (userId) => {
    const events = await Event.find({eventHostId: userId}).exec();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset today's time to 00:00:00
    const user = await User.findById(userId).exec();
    for (const event of events) {
        let endDate;
        try {

            endDate = new Date(event.eventEnd);
        } catch (e) {

            const eventDate = new Date(event.eventDate);
            const [hours, minutes] = event.eventEnd.split(':');
            eventDate.setUTCHours(hours, minutes, 0, 0); // Set the time part
            endDate = eventDate;
        }

        if (isNaN(endDate)) {
            const eventDate = new Date(event.eventDate); // Event's date part
            const [hours, minutes] = event.eventEnd.split(':');
            eventDate.setUTCHours(hours, minutes, 0, 0); // Set the time part again
            endDate = eventDate; // Assign the complete date-time to endDate
        }

        if (today > endDate){
          user.availableBalance += user.pendingBalance;
          user.pendingBalance = 0;
        }
        await user.save()
    }
}