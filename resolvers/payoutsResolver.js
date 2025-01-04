const Payout = require('../models/payoutModel');
const WithdrawalAccount = require('../models/withdrawalAccountModel');
const {createPaystackRecipient, completePawaPayPayout, completePaystackPayout} = require("../utils/helper");
const Wallet = require("../models/walletModel");
const {User: transaction} = require("./userResolver");
const User = require("../models/userModel");

async function payout(_, {id}) {
    try {

        const payout = await Payout.findById(id).exec()
        if (!payout) {
            throw new Error("Payout not found");
        }
        const wallet = await Wallet.findById(payout.walletId).exec()
        const account = await Wallet.findById(payout.withdrawalAccountId).exec()


        if (wallet.availableBalance < payout.amount) {
            throw new Error("Insufficient Balance");
        }
        if (!account.active || account.flagged) {
            throw new Error("Inactive withdrawal account");
        }
        let status;
        const service = account.service;
        let txnId
        if (account.service === 'Pawapay') {
            const result = await completePawaPayPayout(payout.amount, payout, account)
            if (result.status === 'ACCEPTED' || result.status === 'ENQUEUED') {
                status = 'approved'
            } else {
                status = 'failed'
            }
            txnId = result.transactionId
        } else {
            const result = await completePaystackPayout(payout.amount, payout, account)
            if (result.status === 'success' || result.status === 'pending') {
                status = 'approved'
            } else {
                status = 'failed'
            }
            txnId = result.transactionId
        }
        payout.status = status
        payout.transactionId = txnId
        payout.save();
        return payout;
    } catch (error) {
        throw new Error("Error fetching payout: " + error.message);
    }
}

async function payouts() {
    try {
        const payouts = await Payout.find();
        return payouts;
    } catch (error) {
        throw new Error("Error fetching payouts: " + error.message);
    }
}

async function withdrawalAccount(_, {id}) {
    try {
        const account = await WithdrawalAccount.findById(id);
        if (!account) {
            throw new Error("Withdrawal account not found");
        }
        return account;
    } catch (error) {
        throw new Error("Error fetching withdrawal account: " + error.message);
    }
}

async function getUserPayouts(_, {userId}) {
    try {
        const payouts = await Payout.find({userId});
        return payouts;
    } catch (error) {
        throw new Error("Error fetching user payouts: " + error.message);
    }
}

async function completePayout(_, {id}) {
    try {
        const payout = await Payout.findByIdAndUpdate(
            id,
            {status: 'completed'},
            {new: true}
        );
        if (!payout) {
            throw new Error("Payout not found");
        }
        return payout;
    } catch (error) {
        throw new Error("Error completing payout: " + error.message);
    }
}

async function createWithdrawalAccount(_, {input}) {
    try {
        const {userId, type, name, accountNumber, bankCode, currency, bankName} = input;
        const user = await User.findById(userId).exec();
        let withdrawalAccount;
        if (user) {
            if (currency === 'GHS') {
                const recipient = await createPaystackRecipient(userId, type, name, accountNumber, bankCode, currency);
                if (recipient) {
                    console.log(recipient)
                    withdrawalAccount = await WithdrawalAccount.create({
                        userId: userId,
                        type: recipient.type,
                        name: name,
                        accountNumber: accountNumber,
                        bankCode: bankCode,
                        bankName: bankName,
                        currency: currency,
                        recipient_code: recipient.recipient_code,
                        service: 'Paystack'
                    });
                }
            } else {
                withdrawalAccount = await WithdrawalAccount.create({
                    userId: userId,
                    type: 'MSISDN',
                    name: name,
                    accountNumber: accountNumber,
                    currency: currency,
                    bankCode: bankCode,

                    service: 'Pawapay'
                });
            }
            user.withdrawalAccounts = [...user.withdrawalAccounts, withdrawalAccount];
            user.save();
            return res.status(200).json({data: withdrawalAccount, success: true});
        }

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

async function createPayout(_, {input}) {
    try {
        const payout = new Payout(input);
        await payout.save();
        return payout;
    } catch (error) {
        throw new Error("Error creating payout: " + error.message);
    }
}

async function updatePayout(_, {id, input}) {
    try {
        const payout = await Payout.findByIdAndUpdate(id, input, {new: true});
        if (!payout) {
            throw new Error("Payout not found");
        }
        return payout;
    } catch (error) {
        throw new Error("Error updating payout: " + error.message);
    }
}

async function deletePayout(_, {id}) {
    try {
        const payout = await Payout.findByIdAndDelete(id);
        if (!payout) {
            throw new Error("Payout not found");
        }
        return payout;
    } catch (error) {
        throw new Error("Error deleting payout: " + error.message);
    }
}

async function updateWithdrawalAccount(_, {id, input}) {
    try {
        const account = await WithdrawalAccount.findByIdAndUpdate(id, input, {new: true});
        if (!account) {
            throw new Error("Withdrawal account not found");
        }
        return account;
    } catch (error) {
        throw new Error("Error updating withdrawal account: " + error.message);
    }
}

async function deleteWithdrawalAccount(_, {id}) {
    try {
        const account = await WithdrawalAccount.findByIdAndDelete(id);
        if (!account) {
            throw new Error("Withdrawal account not found");
        }
        return account;
    } catch (error) {
        throw new Error("Error deleting withdrawal account: " + error.message);
    }
}

async function getUserWithdrawalAccounts(_, {id}) {
    try {
        const accounts = await WithdrawalAccount.find({userId: id}).exec()
        return accounts;
    } catch (error) {
        console.log("Error getting user: " + error.message);
    }
}

module.exports = {
    Query: {
        payout,
        payouts,
        withdrawalAccount,
        getUserPayouts,
        getUserWithdrawalAccounts,
    },
    Mutation: {
        completePayout,
        createWithdrawalAccount,
        createPayout,
        updatePayout,
        deletePayout,
        updateWithdrawalAccount,
        deleteWithdrawalAccount
    }
};