const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all tickets
// @route GET /api/v1/tickets
exports.getTickets = async(req, res, next) => {
    try {
      const tickets =  await Ticket.find();
  
      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single ticket
// @route GET /api/v1/tickets/:id
exports.getTicket = async(req, res, next) => {
    try {
      const ticket = await Ticket.findById(req.params.id).populate('eventId').populate({ path: 'eventId', populate: { path: 'eventHostId', select: 'firstName lastName'}}).exec();
  
      if(!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user tickets
// @route GET /api/v1/tickets/user/:id/:status
exports.getUserTickets = async(req, res, next) => {
    try {
      const tickets = await Ticket.find({ attendeeId: req.params.id, status: req.params.status }).populate('eventId').populate({ path: 'eventId', populate: { path: 'eventHostId', select: 'firstName lastName'}}).exec();
  
      if(!tickets) {
        return res.status(404).json({
          success: false,
          error: 'Tickets not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

  // @desc Get event tickets
  // @route GET /api/v1/tickets/event/:id
  exports.getEventTickets = async(req, res, next) => {
      try {
        const tickets = await Ticket.find({ eventId: req.params.id });
    
        if(!tickets) {
          return res.status(404).json({
            success: false,
            error: 'Tickets not found'
          });
        }
    
        return res.status(200).json({
          success: true,
          data: tickets
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error'
        });
      }
    }

  // @desc Add ticket
  // @route POST /api/v1/tickets
  exports.addTicket = async (req, res, next) => {
    try {
     /*  const result = async(path) => await cloudinary.uploader.upload(path);
  
      const imageUrls = [];
  
      const files = req.files;
  
      if(files && (files.length > 0)) {
        for (const file of files) {
          const { path } = file;
    
          const newPath = await result(path);
    
          imageUrls.push(newPath.secure_url);
        }
      } */

      const tickets = await Ticket.find({ attendeeId: req.body.attendeeId, eventId: req.body.eventId });
  
      if(tickets.length !== 0) {
        return res.status(404).json({
          success: false,
          error: 'Event already booked'
        });
      }

      const event = await Event.findById(req.body.eventId);
      var ticketsLeft = Number(event.ticketsLeft) - Number(req.body.numberOfTickets);
  
      const ticket = await Ticket.create({
        eventId: req.body.eventId,
        attendeeId: req.body.attendeeId,
        // paymentMethod: req.body.paymentMethod,
        numberOfTickets: req.body.numberOfTickets,
        totalPrice: req.body.totalPrice,
        // amountPaid: req.body.amountPaid,
        status: req.body.status
        // image: imageUrls
      });

      const result = await Event.findByIdAndUpdate(req.body.eventId, { ticketsLeft }, { new: true });
  
      return res.status(201).json({
        success: true,
        data: ticket
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

// @desc Update single ticket
// @route PATCH /api/v1/tickets/:id
  exports.updateTicket = async(req,res) => {
    try {
      const data = req.body;
  
      const result = await Ticket.findByIdAndUpdate(req.params.id, data, { new: true });
  
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

  // @desc Delete ticket
  // @route DELETE /api/v1/tickets/:id
  exports.deleteTicket = async(req, res, next) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
  
      if(!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }
  
      await ticket.remove();
  
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