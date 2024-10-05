const express = require('express');
const router = express.Router();
const { initiateHold, completeTransaction, getHostTransactions} = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// Route to initiate a hold on a ticket
router.route('/initiate').post(auth, initiateHold);

// Route to complete the transaction
router.route('/complete/:reference').get( completeTransaction);
router.route('/host/:id').get(auth,getHostTransactions)

module.exports = router;