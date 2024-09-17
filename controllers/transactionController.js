const axios = require("axios");
const Ticket = require("../models/ticketModel");
const Transaction = require("../models/transactionModel");
const Event = require("../models/eventModel");
const { calculateWeightedRating } = require("../utils/helper");

exports.initiateHold = async (req, res) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const { email, amount, eventId, callback_url } = req.body;
    try {
        // Create a hold on the tickets
        const holdTicket = await Ticket.create({
            eventId,
            attendeeId: req.body.attendeeId,
            paymentMethod: req.body.paymentMethod,
            ticketInfo: req.body.ticketInfo,
            totalPrice: amount,
            status: 'HOLD',
        });

        const reference = holdTicket._id.toString();

        // Paystack transaction initialization
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100,
                reference,
                callback_url,
            },
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`
                },
            }
        );

        // Save the transaction details with a status of PENDING
        await Transaction.create({
            reference,
            status: 'PENDING',
            eventId,
            attendeeId: req.body.attendeeId,
            amount
        });

        // Set timeout to verify transaction after 10 minutes
        setTimeout(async () => {
            try {
                const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                    },
                });

                if (verifyResponse.data.data.status !== 'success') {
                    await Ticket.deleteOne({ _id: holdTicket._id });
                    await Transaction.updateOne({ reference }, { status: 'FAILED' });
                }
            } catch (error) {
                console.error(`Error verifying transaction for hold ticket ID ${reference}: `, error.message);
            }
        }, 10 * 60 * 1000); // 10 minutes

        res.status(200).json({
            success: true,
            reference,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.completeTransaction = async (req, res) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    try {
        const reference = req.params.reference;

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });

        if (response.data.data.status === 'success') {
            const ticket = await Ticket.findOneAndUpdate(
                { _id: reference },
                { status: 'CONFIRMED', amountPaid: response.data.data.amount / 100 },
                { new: true }
            );

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Update event ticket sales count and calculate weighted average
            const event = await Event.findById(ticket.eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            event.ticketSales += ticket.ticketInfo.reduce((total, item) => total + item.numberOfTickets, 0);
            await event.save();
            await calculateWeightedRating(ticket.eventId);

            await Transaction.updateOne({ reference }, { status: 'SUCCESS' });

            res.status(200).json({
                success: true,
                data: ticket
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Transaction verification failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};