const Payout = require('../models/payoutModel');
const WithdrawalAccount = require('../models/withdrawalAccountModel');
const {createPaystackRecipient} = require("../utils/helper");
const axios = require("axios");
const process = require("node:process");

// @desc Create withdrawal account
// @route POST /api/v1/payouts/account/create
exports.addWithdrawalAccount = async (req, res) => {

    try {
        const {userId, type, name,accountNumber,bankCode,currency} =req.body;
        let withdrawalAccount;
        if (currency === 'GHS'){
            const recipient = await createPaystackRecipient(userId, type, name, accountNumber,bankCode,currency);
            const withdrawalAccount = await WithdrawalAccount.create({
                userId: userId,
                type: type,
                name: name,
                accountNumber: accountNumber,
                bankCode: bankCode,
                currency: currency,
                recipient_code: recipient.recipient_code,
                service: 'Paystack'
            });
        } else {
            const withdrawalAccount = await WithdrawalAccount.create({
                userId: userId,
                type: type,
                name: name,
                accountNumber: accountNumber,
                currency: currency,
                service: 'Pawapay'
            });
        }
    } catch (error) {

    }
}

// @desc get paystack banks
// @route GET /api/v1/payouts/banks
exports.getPaystackBanks = async (req, res) => {

    const response = await axios.get(`https://api.paystack.co/bank`,{
        params: {currency: req.query.currency},
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });
    return res.status(200).json({
        success: true,
        data:response.data.data,
    });
}

// @desc get paystack banks
// @route POST /api/v1/payouts/configs
exports.getPawapayConfigs = async (req, res) => {
    const response = await axios.get('https://api.sandbox.pawapay.cloud/active-conf',{ headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PAWAPAY_SECRET_KEY}`
        }});
    return res.status(200).json({
        data: response.data.countries,
        success: true,
    })
}


// @desc Get withdrawal account
// @route GET /api/v1/payouts/account/:id
exports.getWithdrawalAccount = async (req, res) => {
    try {

        const withdrawalAccount = await WithdrawalAccount.findById(req.params.id);
        return res.status(200).json({
            success: true,
            data: withdrawalAccount,
        })
    } catch (error) {

    }
}

// @desc delete withdrawal account
// @route DELETE /api/v1/payouts/account/:id
exports.deleteWithdrawalAccount = async (req, res) => {
    try {

    } catch (error) {

    }
}

// @desc request payout
// @route POST /api/v1/payouts/create
exports.requestPayout = async (req, res) => {
    try {
        const {amount, currency, walletId, withdrawalAccountId, userId} = req.body;
        const payout = await Payout.create({amount, currency, walletId, withdrawalAccountId, userId, status: 'pending'})
        return res.status(200).json({
            data: payout,
            success: true,
        })
    } catch (error) {

    }
}

// @desc Get user payouts
// @route GET /api/v1/payouts/:id
exports.getPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find({userId: req.params.id});
        return res.status(200).json({
            success: true,
            data: payouts,
        })
    } catch (error) {

    }
}