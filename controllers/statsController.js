const Following = require('../models/followingModel');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const cloudinary = require('../middleware/cloudinary');


// @desc Get user stats
// @route GET /api/v1/stats/user/:id
exports.getUserStats = async(req, res, next) => {
  try {
    // const favorites = await Favorites.find({ userId: req.params.id }).populate('eventId').populate({ path: 'eventId', populate: { path: 'eventHostId', select: '_id firstName lastName image'}}).exec();

    const followingData = await Following.findOne({ userId: req.params.id });
    const event = await Event.countDocuments({ eventHostId: req.params.id });

    const followersCount = followingData.followers.length;

    return res.status(200).json({
      success: true,
      data: {
        followers: followersCount,
        events: event,
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}