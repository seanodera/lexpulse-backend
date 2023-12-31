const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all events
// @route GET /api/v1/events
exports.getEvents = async(req, res, next) => {
    try {
      const events =  await Event.find({ approved: true, country: req.query.country }).populate({ path: 'eventHostId', select: '_id firstName lastName image' }).exec();
  
      return res.status(200).json({
        success: true,
        data: events
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single event
// @route GET /api/v1/events/:id
exports.getEvent = async(req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      const ticket = await Ticket.countDocuments({ eventId: req.params.id });
  
      if(!event) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: {
          event: event,
          tickets: ticket
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user events
// @route GET /api/v1/events/user/:id
exports.getUserEvents = async(req, res, next) => {
  try {
    const events = await Event.find({ eventHostId: req.params.id });

    if(!events) {
      return res.status(404).json({
        success: false,
        error: 'Events not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add event
// @route POST /api/v1/events
exports.addEvent = async (req, res, next) => {
  try {
    const result = async(path) => await cloudinary.uploader.upload(path);

    const imageUrls = [];

    const files = req.files;

    if(files && (files.length > 0)) {
      for (const file of files) {
        const { path } = file;
  
        const newPath = await result(path);
  
        imageUrls.push(newPath.secure_url);
      }
    }

    const event = await Event.create({
      eventHostId: req.body.eventHostId,
      eventName: req.body.eventName,
      location: req.body.location,
      category: req.body.category,
      currency: req.body.currency,
      country: req.body.country,
      ticketInfo: req.body.ticketInfo,
      eventDate: req.body.eventDate,
      image: imageUrls,
      description: req.body.description,
      approved: false
    });

    return res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Update event
// @route PATCH /api/v1/events/:id
exports.updateEvent = async(req,res) => {
  try {
    const result = async(path) => await cloudinary.uploader.upload(path);

    const imageUrls = [];

    const files = req.files;

    if(files && (files.length > 0)) {
      for (const file of files) {
        const { path } = file;
  
        const newPath = await result(path);
  
        imageUrls.push(newPath.secure_url);
      }
    }

    const data = req.body;

    const result1 = await Event.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.status(201).json({
      success: true,
      data: result1
    });
  } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Delete event
// @route DELETE /api/v1/events/:id
exports.deleteEvent = async(req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if(!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    await event.remove();

    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}