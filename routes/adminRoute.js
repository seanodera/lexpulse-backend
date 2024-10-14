const express = require('express');
const {checkAdmin, checkAdminVerification, createAdmin, sendAdminInvite, processAdminInvite, activateAdmin} = require("../controllers/adminController");
const router = express.Router();

router.route('/auth').post(checkAdmin)
router.route('/auth/confirm-code').get(checkAdminVerification);

router.route('/create').post(createAdmin);
router.route('/invite/:id').post(sendAdminInvite).get(processAdminInvite);
router.route('/activate').post(activateAdmin);

module.exports = router;