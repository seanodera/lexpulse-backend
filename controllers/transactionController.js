const axios = require("axios");
const Ticket = require("../models/ticketModel");
const Transaction = require("../models/transactionModel");
const Event = require("../models/eventModel");
const { calculateWeightedRating, convertCurrency} = require("../utils/helper");
const moment = require("moment/moment");
const User = require("../models/userModel");
var postmark = require("postmark");
var client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);

//@route /api/v1/transactions/initiate
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
        const event = await Event.findById(eventId).exec();

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        const finalAmount = await convertCurrency(amount, event.currency)

        console.log(finalAmount);
        const reference = holdTicket._id.toString();

        // Paystack transaction initialization
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: (finalAmount * 100).toFixed(0),
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

//@route /api/v1/complete/:reference
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
            const user = await User.findOne({ _id: ticket.attendeeId }).exec();
            const {totalPrice, amountPaid} = ticket;
            const msg = {
                to: user.email, // Change to your recipient
                from: {
                    email: 'thelexpulseteam@fadorteclimited.com',
                    name: 'Lexpulse'
                },
                subject: 'Ticket Booking Successful',
                // text: 'and easy to do anywhere, even with Node.js',
                html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link href='https://fonts.googleapis.com/css?family=Open Sans' rel='stylesheet'>
        <title>Ticket Booking Successful</title>
        
        
        <style type="text/css">
          @font-face {
          font-family: 'Open Sans';
        }
        img {
        max-width: 100%;
        }
        body {
        -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
        }
        body {
        background-color: #FFFFFF;
        }
        @media only screen and (max-width: 640px) {
          body {
            padding: 0 !important;
          }
          h1 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h2 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h3 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h4 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h1 {
            font-size: 22px !important;
          }
          h2 {
            font-size: 18px !important;
          }
          h3 {
            font-size: 16px !important;
          }
          .container {
            padding: 0 !important; width: 100% !important;
          }
          .content {
            padding: 0 !important;
          }
          .content-wrap {
            padding: 10px !important;
          }
          .invoice {
            width: 100% !important;
          }
        }
        </style>
        </head>
        
        <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #F5F7FB; margin: 0;" bgcolor="#F5F7FB">
        
        <table class="body-wrap" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #F5F7FB; margin: 0;" bgcolor="#F5F7FB"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
            <td class="container" width="600" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
              <div class="content" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
                <table class="main" width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; border-radius: 8px; background-color: #FFFFFF; margin: 0; border: 8px solid #FFFFFF; box-shadow: 0 2px 21px 0 rgba(0,112,224,0.12);" bgcolor="#FFFFFF"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="alert alert-warning" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; color: #FFFFFF; font-weight: 500; text-align: center; border-radius: 8px 8px 0 0; background-color: #FFFFFF; margin: 0; padding: 20px;" align="center" bgcolor="#FFFFFF" valign="top">
                      <img src="https://res.cloudinary.com/dhfif2kjc/image/upload/v1703946360/logo_muinkl.png" alt="Jengaapp" height="40" width="150" align="left" hspace="5%">
                      <br>
                      <br>
                      <hr width="90%" style="border: solid 0.5px #eaeef6;" >
        
                    </td>
                  </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-wrap" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 20px; color:#25265E;" valign="top">
                      <table width="90%" cellpadding="0" cellspacing="0" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; color:#25265E; padding: 0 0 0;" valign="top">
                            Congratulations ${user.firstName}!
                            <br><br>
                            You have successfully booked this event. Below are the details of your order.
                            <br><br>
                            <hr style="border: solid 0.5px #eaeef6;">
                            <br>
                            <b>Ticket Total</b>
                            <br>
                            ${event.currency} ${totalPrice}
                            <br><br>
                            <b>Date</b>
                            <br>
                            ${moment.utc(event.eventDate).local().format('dddd, MMMM DD, YYYY')}
                            <br><br>
                            <b>Venue</b>
                            <br>
                            ${event.location}
                          </td>
                        </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 0 25px;" valign="top">
                          <br>
                          <br>
                          <hr width="100%" style="border: solid 0.5px #eaeef6;" >
                          </td>
                        </tr><tr align="center" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; margin: 0; color:#25265E;"><td class="content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 16px; vertical-align: top; margin: 0; padding: 0 0 25px;" valign="top">
                            Have any questions? Email us at: <span style="color:#0070E0; text-decoration: none;">thelexpulseteam@fadorteclimited.com</span>.
                          </td>
                        </tr></table></td>
                  </tr></table><div class="footer" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #25265E; margin: 0; padding: 20px;">
                  <table width="100%" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0; color: #25265E;"><tr style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; margin: 0; color: #25265E;"><td class="aligncenter content-block" style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; color: #25265E; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Copyright © 2024 Lexpulse. All Rights Reserved</td>
                    </tr></table></div></div>
            </td>
            <td style="font-family: 'Open Sans', Helvetica, Sans-Serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
          </tr></table></body>
        </html>`,
            };

            // const emailSend = await sgMail.send(msg);

            const emailSend = client.sendEmail({
                "From": "thelexpulseteam@fadorteclimited.com",
                "To": user.email,
                "Subject": "Ticket Booking Successful",
                "HtmlBody": msg.html,
                "MessageStream": "outbound"
            });


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