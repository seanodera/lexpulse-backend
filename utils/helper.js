const Event = require('../models/eventModel');

exports.calculateWeightedRating = async (eventId) => {
    const event = await Event.findById(eventId);
    if (event) {
        const { viewCount, ticketSales, averageRating } = event;
        const weightedRating = (0.4 * viewCount) + (0.6 * ticketSales);
        event.weightedRating = weightedRating;
        await event.save();
        return weightedRating;
    }
};
