const express = require('express');
const {
    addWithdrawalAccount,
    getPaystackBanks,
    getWithdrawalAccount,
    deleteWithdrawalAccount,
    requestPayout,
    getPayouts, getPawapayConfigs
} = require("../controllers/payoutsController");
const router = express.Router();



router.route('/banks').get(getPaystackBanks);
router.route('/configs').get(getPawapayConfigs);

router.route('/account/:id').post(addWithdrawalAccount).get(getWithdrawalAccount).delete(deleteWithdrawalAccount);



router.route('/create').post(requestPayout);

router.route('/:id').get(getPayouts);

module.exports = router;