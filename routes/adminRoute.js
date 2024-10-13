const express = require('express');
const {checkAdmin, checkAdminVerification} = require("../controllers/adminController");
const router = express.Router();

router.route('/auth').post(checkAdmin)
router.route('/auth/confirm-code').get(checkAdminVerification);

module.exports = router;