const Scanner = require('../models/scannerModel');
const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc Create a new scanner without password
// @route POST /api/v1/scanners/create
exports.createScanner = async (req, res, next) => {
    try {
        const { eventId, email, name } = req.body;

        if(!eventId || !email || !name) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }

        const newScanner = new Scanner({
            eventId,
            email,
            name,
            activated: false,
            scannedTickets: 0,
        });

        await newScanner.save();

        // Update event model
        await Event.findByIdAndUpdate(eventId, {
            $push: { scanners: newScanner._id }
        });

        return res.status(201).json({
            success: true,
            data: newScanner
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// @desc Activate scanner account
// @route POST /api/v1/scanners/activate
exports.activateScanner = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }

        const scanner = await Scanner.findOne({ email });

        if (!scanner) {
            return res.status(404).json({
                success: false,
                error: 'Scanner not found'
            });
        }

        if (scanner.password) {
            return res.status(400).json({
                success: false,
                error: 'Account is already activated'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        scanner.password = hashedPassword;
        scanner.activated = true;
        await scanner.save();

        // No changes to Event model on activation

        return res.status(200).json({
            success: true,
            message: 'Account activated'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// @desc Login scanner
// @route POST /api/v1/scanners/login
exports.loginScanner = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }

        const scanner = await Scanner.findOne({ email });

        if (!scanner) {
            return res.status(404).json({
                success: false,
                error: 'Scanner not found'
            });
        }

        if (!scanner.password || !scanner.activated) {
            return res.status(400).json({
                success: false,
                error: 'Account is not activated'
            });
        }

        const isMatch = await bcrypt.compare(password, scanner.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign({ id: scanner._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// @desc Scan a ticket
// @route POST /api/v1/scanners/scan
exports.scanTicket = async (req, res, next) => {
    try {
        const { ticketId, scannerId } = req.body;

        if (!ticketId || !scannerId) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }

        const ticket = await Ticket.findById(ticketId);
        const scanner = await Scanner.findById(scannerId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }

        if (!scanner) {
            return res.status(404).json({
                success: false,
                error: 'Scanner not found'
            });
        }

        ticket.status = 'Scanned';
        ticket.scannedBy = scannerId;
        await ticket.save();

        scanner.scannedTickets += 1;
        await scanner.save();

        return res.status(200).json({
            success: true,
            message: 'Ticket scanned successfully',
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// @desc Delete a scanner
// @route DELETE /api/v1/scanners/:id
exports.deleteScanner = async (req, res, next) => {
    try {
        const { id } = req.params;

        const scanner = await Scanner.findById(id);

        if (!scanner) {
            return res.status(404).json({
                success: false,
                error: 'Scanner not found'
            });
        }

        await scanner.remove();

        // Remove scanner from event's scanners list
        await Event.findByIdAndUpdate(scanner.eventId, {
            $pull: { scanners: scanner._id }
        });

        return res.status(200).json({
            success: true,
            message: 'Scanner deleted'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};