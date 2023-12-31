const ReferralCode = require('../models/referralCodeModel');
const shortid = require('shortid');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all referral codes
// @route GET /api/v1/referral-codes
exports.getReferralCodes = async(req, res, next) => {
    try {
      const referralCodes =  await ReferralCode.find().populate({ path: 'userId', select: 'firstName lastName image' }).exec();
  
      return res.status(200).json({
        success: true,
        data: referralCodes
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single referral code
// @route GET /api/v1/referral-codes/:id
exports.getReferralCode = async(req, res, next) => {
    try {
      const referralCode = await ReferralCode.findById(req.params.id);
  
      if(!referralCode) {
        return res.status(404).json({
          success: false,
          error: 'Referral Code not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: referralCode
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user referral code
// @route GET /api/v1/referral-codes/user/:id
exports.getUserReferralCodes = async(req, res, next) => {
  try {
    const referralCode = await ReferralCode.findOne({ userId: req.params.id });

    if(!referralCode) {
      return res.status(404).json({
        success: false,
        error: 'Referral Code not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: referralCode
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add referral code
// @route POST /api/v1/referral-codes
exports.addReferralCode = async (req, res, next) => {
  try {

    const referralCode = await ReferralCode.create({
      userId: req.body.userId,
      code: shortid.generate()
    });

    return res.status(201).json({
      success: true,
      data: referralCode
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

// @desc Update referral code
// @route PATCH /api/v1/referral-codes/:id
exports.updateReferralCode = async(req, res) => {
  try {
    
    const data = req.body;

    const result = await ReferralCode.findByIdAndUpdate(req.params.id, data, { new: true });

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

// @desc Delete referral code
// @route DELETE /api/v1/referral-codes/:id
exports.deleteReferralCode = async(req, res, next) => {
  try {
    const referralCode = await ReferralCode.findById(req.params.id);

    if(!referralCode) {
      return res.status(404).json({
        success: false,
        error: 'Referral Code not found'
      });
    }

    await referralCode.remove();

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