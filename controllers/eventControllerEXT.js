const Event = require("../models/eventModel");
const Promotion = require("../models/promotionModel");

//@route Get /api/v1/events/upcoming
exports.getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let query = {
            approved: true,
            country: req.query.country,
            eventDate: { $gte: today },
        };
        const pageSize = 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * pageSize;

        const events = await Event.find(query)
            .sort({ eventDate: -1 })
            .skip(skip)
            .limit(pageSize)
            .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
            .exec();

        const totalEvents = await Event.countDocuments(query);
        const hasMore = skip + events.length < totalEvents;

        return res.status(200).json({
            success: true,
            data: events,
            hasMore,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

//@desc GET api/v1/events/popular
exports.getPopularEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let query = {
            approved: true,
            country: req.query.country,
            eventDate: { $gte: today },
        };

        const events = await Event.find(query)
            .sort({ weightedRating: 1, eventDate: -1 })
            .limit(25)
            .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
            .exec();

        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

//@route GET api/v1/events/featured
exports.getPromotedEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const query = {
            country: req.query.country,
            eventDate: { $gte: today, $lte: today },
        };
        const promotions = await Promotion.find(query)
            .populate({
                path: 'eventId',
            })
            .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
            .exec();
        let events;
        if (promotions.length === 0) {
            let eventQuery = {
                approved: true,
                country: req.query.country,
                eventDate: { $gte: today },
            };
            events = await Event.find(eventQuery)
                .sort({ weightedRating: 1, eventDate: -1 })
                .limit(4)
                .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
                .exec();
        } else {
            events = promotions;
        }
        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};


//@route api/v1/events/category/:category
exports.getCategoryEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let query = {
            approved: true,
            country: req.query.country || '',
            category: req.params.category,
            eventDate: { $gte: today },
        };
        const pageSize = 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * pageSize;

        const events = await Event.find(query)
            .sort({ eventDate: -1 })
            .skip(skip)
            .limit(pageSize)
            .populate({ path: 'eventHostId', select: '_id firstName lastName image' })
            .exec();

        const totalEvents = await Event.countDocuments(query);
        const hasMore = skip + events.length < totalEvents;

        return res.status(200).json({
            success: true,
            data: events,
            hasMore,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

//@route api/v1/events/views
exports.updateViewCounts = async (req, res) => {
    try {
        const events = req.body.events; // Array of event IDs

        // Validate that events array exists
        if (!events || !Array.isArray(events)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of events.' });
        }

        // Loop through the events and increment view counts
        for (let eventId of events) {
            await Event.findByIdAndUpdate(eventId, { $inc: { viewCount: 1 } });
        }

        res.status(200).json({ message: 'View counts updated successfully' });
    } catch (e) {
        console.error('Error updating view counts:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
