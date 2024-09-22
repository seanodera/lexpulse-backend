const Venue = require('../models/venueModel');


// Add a new venue
exports.addVenue = async (req, res) => {
    const { name, street, city, district, country, links, cover, capacity, type, description, phone, email } = req.body;
    try {
        const newVenue = new Venue({
            name,
            street,
            city,
            district,
            country,
            links,
            cover,
            capacity,
            type,
            description,
            phone,
            email
        });
        const savedVenue = await newVenue.save();
        res.status(201).json({success: true,data: savedVenue});
    } catch (error) {
        res.status(500).json({ error: 'Failed to add venue' });
    }
};

// Search for venues
exports.searchVenues = async (req, res) => {
    const { term } = req.query;
    try {
        const venues = await Venue.find({
            $or: [
                { name: { $regex: term, $options: 'i' } },
                { city: { $regex: term, $options: 'i' } },
                { country: { $regex: term, $options: 'i' } }
            ]
        });
        res.status(200).json({success: true,data:venues});
    } catch (error) {
        res.status(500).json({ error: 'Failed to search venues' });
    }
};

// Update a venue
exports.updateVenue = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedVenue = await Venue.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedVenue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true,data: updatedVenue});
    } catch (error) {
        res.status(500).json({ error: 'Failed to update venue' });
    }
};

// Get a single venue by id
exports.getVenue = async (req, res) => {
    const { id } = req.params;
    try {
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true,data: venue});
    } catch (error) {
        res.status(500).json({ error: 'Failed to get venue' });
    }
};

exports.getUserVenue = async (req, res) => {
    const userId = req.params.userId;
    try {
        const venues = await Venue.find({ userId: userId });
        res.status(200).json({ success: true, data: venues });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user venues' });
    }
}

// Delete a venue by id
exports.deleteVenue = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedVenue = await Venue.findByIdAndDelete(id);
        if (!deletedVenue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true, message: 'Venue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete venue' });
    }
};