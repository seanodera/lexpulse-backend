const Notifications = require('../models/notificationsModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all notifications
// @route GET /api/v1/notifications
exports.getNotifications = async(req, res, next) => {
    try {
      let query = {};

      if (req.query.userId) {
        query.$or = [{ userId: req.query.userId }, { userId: null }];
      }

      const notifications = await Notifications.find(query);
  
      return res.status(200).json({
        success: true,
        data: notifications.reverse()
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single notification
// @route GET /api/v1/notifications/:id
exports.getNotification = async(req, res, next) => {
    try {
      const notification = await Notifications.findById(req.params.id);
  
      if(!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notifications not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user notifications
// @route GET /api/v1/notifications/user/:id
exports.getUserNotifications = async(req, res, next) => {
  try {
    const notifications = await Notifications.findOne({ userId: req.params.id });

    if(!notifications) {
      return res.status(404).json({
        success: false,
        error: 'Notifications not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add notifications
// @route POST /api/v1/notifications
exports.addNotifications = async (req, res, next) => {
  try {

    const notifications = await Notifications.create({
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      notificationType: req.body.notificationType
    });

    return res.status(201).json({
      success: true,
      data: notifications
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

// @desc Update notifications
// @route PATCH /api/v1/notifications/:id
exports.updateNotifications = async(req, res) => {
  try {
    
    const data = req.body;

    const result = await Notifications.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.status(201).json({
      success: true,
      data: result
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

// @desc Delete notifications
// @route DELETE /api/v1/notifications/:id
exports.deleteNotifications = async(req, res, next) => {
  try {
    const notifications = await Notifications.findById(req.params.id);

    if(!notifications) {
      return res.status(404).json({
        success: false,
        error: 'Notifications not found'
      });
    }

    await notifications.remove();

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