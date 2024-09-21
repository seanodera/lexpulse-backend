const express = require('express');
const router = express.Router();
const { createScanner, activateScanner, loginScanner, scanTicket, deleteScanner } = require('../controllers/scannerController');
const auth = require('../middleware/authMiddleware');
const scannerAuth = require('../middleware/scannerAuth');
router
    .route('/create')
    .post(auth,createScanner);

router
    .route('/activate')
    .post(activateScanner);

router
    .route('/login')
    .post(loginScanner);

router
    .route('/scan')
    .post(scannerAuth,scanTicket);

router
    .route('/:id')
    .delete(auth,deleteScanner);

module.exports = router;